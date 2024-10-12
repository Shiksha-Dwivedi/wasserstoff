export class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  // Add an item to the queue
  enqueue(item) {
    // Insert item in sorted order based on priority
    const index = this.queue.findIndex((i) => i.priority > item.priority);
    if (index === -1) {
      this.queue.push(item); // Add to the end if no higher priority found
    } else {
      this.queue.splice(index, 0, item); // Insert at the correct position
    }
  }

  // Remove and return the item with the highest priority (lowest number)
  dequeue() {
    return this.queue.shift(); // Remove from the front
  }

  // Check if the queue is empty
  isEmpty() {
    return this.queue.length === 0;
  }
}


