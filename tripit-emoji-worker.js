/**
 * Cloudflare Worker to add emojis to TripIt calendar events
 * 
 * This worker fetches a TripIt ICS feed, identifies event types,
 * and prepends appropriate emojis to event summaries.
 * 
 * Required environment variable:
 * - TRIPIT_FEED_URL: Your private TripIt ICS feed URL
 *   Set this in Cloudflare Dashboard > Workers > Settings > Variables and Secrets
 */

// Emoji mappings
const EMOJIS = {
  FLIGHT: '✈️',
  HOTEL: '🛎️',
  CAR_RENTAL: '🚘',
  PARKING: '🚙',
  TRAIN: '🚆'
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
  
  // Check for train/rail
  if (summaryLower.includes('amtrak') || 
      summaryLower.includes('train hall') ||
      descriptionLower.includes('[rail]')) {
    return 'TRAIN';
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
function addEmojiToSummary(line, emoji, eventType) {
  const match = line.match(/^SUMMARY:(.*)$/);
  if (match) {
    const originalSummary = match[1];
    // Check if emoji already exists to avoid double-adding
    if (originalSummary.startsWith(emoji)) {
      return line;
    }
    
    // Special formatting for flights: ✈️ EWR→ATL • DL2353
    if (eventType === 'FLIGHT') {
      const flightMatch = originalSummary.match(/^([A-Z]{2,3}\d{2,4})\s+([A-Z]{3})\s+to\s+([A-Z]{3})/i);
      if (flightMatch) {
        const [, flightNumber, origin, destination] = flightMatch;
        return `SUMMARY:${emoji} ${origin}→${destination} • ${flightNumber}`;
      }
    }
    
    // Default: just prepend emoji
    return `SUMMARY:${emoji} ${originalSummary}`;
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
      // If we have an unprocessed summary, add it now (with or without emoji)
      if (currentSummary) {
        const summaryText = currentSummary.substring(8); // Remove "SUMMARY:"
        eventType = getEventType(summaryText, currentDescription);
        
        if (eventType && EMOJIS[eventType]) {
          processedLines.push(addEmojiToSummary(currentSummary, EMOJIS[eventType], eventType));
        } else {
          processedLines.push(currentSummary);
        }
        currentSummary = null;
      }
      
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
          processedLines.push(addEmojiToSummary(currentSummary, EMOJIS[eventType], eventType));
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
      // Get TripIt feed URL from environment variable
      const TRIPIT_FEED_URL = env.TRIPIT_FEED_URL;
      
      // Validate that the environment variable is set
      if (!TRIPIT_FEED_URL) {
        return new Response(
          'Error: TRIPIT_FEED_URL environment variable is not set.\n\n' +
          'Please add it in the Cloudflare dashboard:\n' +
          '1. Go to Workers & Pages > Your Worker > Settings\n' +
          '2. Click "Variables and Secrets"\n' +
          '3. Add variable: TRIPIT_FEED_URL\n' +
          '4. Paste your TripIt ICS feed URL\n' +
          '5. Click "Encrypt" (recommended) and "Deploy"\n\n' +
          'Or use Wrangler CLI: wrangler secret put TRIPIT_FEED_URL',
          {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
          }
        );
      }
      
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
