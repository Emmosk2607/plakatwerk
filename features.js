export const eventsEnabled = window.PLAKATWERK_FEATURES?.eventsAndTickets === true;
for(const node of document.querySelectorAll('[data-events-text-on]')){
 node.textContent=eventsEnabled?node.dataset.eventsTextOn:node.dataset.eventsTextOff;
}
