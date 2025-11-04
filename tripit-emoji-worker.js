/**
 * Cloudflare Worker to add emojis to TripIt calendar events
 * 
 * This worker fetches a TripIt ICS feed, identifies event types,
 * and prepends appropriate emojis to event summaries.
 */

// TODO: Replace with your private TripIt feed URL
// Get this from: TripIt.com → Account Settings → Calendar Feeds
const TRIPIT_FEED_URL = 'YOUR-TRIPIT-FEED-URL-HERE';

// Emoji mappings
const EMOJIS = {
  FLIGHT: '✈️',
  HOTEL: '🛎️',
  CAR_RENTAL: '🚘',
  PARKING: '🚙'
};

/**
 * Determines the event type based on summary and description
 */
function getEventType(summary, description) {
  const summaryLower = summary.toLowerCase();
  const descriptionLower = description.toLowerCase();
  
  // Check for parking first (most specific)
  if (summaryLower.includes('parking') || descriptionLower.includes('[parking]')) {
    return 'PARKING';
  }
  
  // Check for car rental
  if (summaryLower.includes('rental car') || 
      summaryLower.includes('pick up rental') || 
      summaryLower.includes('drop off rental') ||
      descriptionLower.includes('[car rental]')) {
    return 'CAR_RENTAL';
  }
  
  // Check for hotel/lodging
  if (summaryLower.includes('check-in:') || 
      summaryLower.includes('check-out:') ||
      descriptionLower.includes('[lodging]')) {
    return 'HOTEL';
  }
  
  // Check for flights - look for flight patterns
  if (descriptionLower.includes('[flight]') || 
      /\b[A-Z]{2,3}\d{2,4}\b/.test(summary) || // Flight numbers like DL738
      (summaryLower.includes(' to ') && /\b[A-Z]{3}\b/.test(summary))) { // Airport codes
    return 'FLIGHT';
  }
  
  return null;
}

/**
 * Adds emoji to the beginning of a SUMMARY line
 */
function addEmojiToSummary(line, emoji) {
  // SUMMARY lines look like: SUMMARY:Event Name
  // We want to change it to: SUMMARY:✈️ Event Name
  const match = line.match(/^SUMMARY:(.*)$/);
  if (match) {
    const originalSummary = match[1];
    // Check if emoji already exists to avoid double-adding
    if (!originalSummary.startsWith(emoji)) {
      return `SUMMARY:${emoji} ${originalSummary}`;
    }
  }
  return line;
}

/**
 * Processes the ICS content and adds emojis
 */
function processICS(icsContent) {
  const lines = icsContent.split(/\r?\n/);
  const processedLines = [];
  
  let inEvent = false;
  let currentSummary = null;
  let currentDescription = '';
  let eventType = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track when we enter/exit an event
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentSummary = null;
      currentDescription = '';
      eventType = null;
      processedLines.push(line);
      continue;
    }
    
    if (line === 'END:VEVENT') {
      inEvent = false;
      processedLines.push(line);
      continue;
    }
    
    if (inEvent) {
      // Collect SUMMARY
      if (line.startsWith('SUMMARY:')) {
        currentSummary = line;
      }
      
      // Collect DESCRIPTION (may span multiple lines due to folding)
      if (line.startsWith('DESCRIPTION:')) {
        currentDescription = line.substring(12); // Remove "DESCRIPTION:"
      } else if (currentDescription && line.startsWith(' ')) {
        // Continuation line (RFC 5545 line folding)
        currentDescription += line.substring(1);
      }
      
      // When we hit SUMMARY, we need to look ahead to get the description
      // So we'll process the SUMMARY later
      if (line.startsWith('SUMMARY:')) {
        // Store it but don't add yet
        continue;
      }
      
      // When we're done collecting info for this event property, process SUMMARY
      if (currentSummary && (line.startsWith('LOCATION:') || line.startsWith('UID:') || line.startsWith('DTSTART'))) {
        // Determine event type
        const summaryText = currentSummary.substring(8); // Remove "SUMMARY:"
        eventType = getEventType(summaryText, currentDescription);
        
        // Add emoji if we identified the type
        if (eventType && EMOJIS[eventType]) {
          processedLines.push(addEmojiToSummary(currentSummary, EMOJIS[eventType]));
        } else {
          processedLines.push(currentSummary);
        }
        
        currentSummary = null; // Mark as processed
      }
    }
    
    processedLines.push(line);
  }
  
  return processedLines.join('\r\n');
}

/**
 * Main worker handler
 */
export default {
  async fetch(request, env, ctx) {
    try {
      // Fetch the original TripIt ICS feed
      const response = await fetch(TRIPIT_FEED_URL);
      
      if (!response.ok) {
        return new Response(`Failed to fetch TripIt feed: ${response.status}`, {
          status: 502,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      const icsContent = await response.text();
      
      // Process the ICS content to add emojis
      const modifiedICS = processICS(icsContent);
      
      // Return the modified ICS feed
      return new Response(modifiedICS, {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Cache-Control': 'public, max-age=900', // Cache for 15 minutes
          'Access-Control-Allow-Origin': '*'
        }
      });
      
    } catch (error) {
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};
