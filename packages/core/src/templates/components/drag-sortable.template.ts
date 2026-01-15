export interface DragSortableOptions {
  itemSelector?: string
  handleSelector?: string
  onUpdate?: () => void
}

export function getDragSortableScript(): string {
  return `
    <script>
      if (!window.__sonicDragSortableInit) {
        window.__sonicDragSortableInit = true;

        window.initializeDragSortable = function(container, options) {
          if (!container || container.dataset.dragSortableInit === 'true') {
            return;
          }

          container.dataset.dragSortableInit = 'true';
          const itemSelector = options && options.itemSelector ? options.itemSelector : '.sortable-item';
          const handleSelector = options && options.handleSelector ? options.handleSelector : '[data-action="drag-handle"]';
          const onUpdate = options && typeof options.onUpdate === 'function' ? options.onUpdate : function() {};
          let activeDragItem = null;

          const getDragAfterElement = function(list, y) {
            const items = Array.from(list.querySelectorAll(itemSelector + ':not(.is-dragging)'));
            let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
            items.forEach(function(item) {
              const box = item.getBoundingClientRect();
              const offset = y - box.top - box.height / 2;
              if (offset < 0 && offset > closest.offset) {
                closest = { offset: offset, element: item };
              }
            });
            return closest.element;
          };

          const activateDragItem = function(event) {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const handle = target.closest(handleSelector);
            if (!handle) return;
            const item = handle.closest(itemSelector);
            if (!item) return;
            activeDragItem = item;
          };

          const clearActiveDragItem = function() {
            activeDragItem = null;
          };

          container.addEventListener('pointerdown', activateDragItem);
          container.addEventListener('mousedown', activateDragItem);
          container.addEventListener('pointerup', clearActiveDragItem);
          container.addEventListener('mouseup', clearActiveDragItem);

          container.addEventListener('dragstart', function(event) {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const item = target.closest(itemSelector);
            if (!item || item !== activeDragItem) {
              event.preventDefault();
              return;
            }
            item.classList.add('is-dragging');
            if (event.dataTransfer) {
              event.dataTransfer.setData('text/plain', '');
            }
          });

          container.addEventListener('dragend', function(event) {
            const target = event.target;
            if (target instanceof Element) {
              const item = target.closest(itemSelector);
              if (item) {
                item.classList.remove('is-dragging');
              }
            }
            activeDragItem = null;
            onUpdate();
          });

          container.addEventListener('dragover', function(event) {
            event.preventDefault();
            const dragging = container.querySelector(itemSelector + '.is-dragging');
            if (!dragging) return;
            const afterElement = getDragAfterElement(container, event.clientY);
            if (afterElement === null) {
              container.appendChild(dragging);
            } else {
              container.insertBefore(dragging, afterElement);
            }
          });

          container.addEventListener('drop', function() {
            onUpdate();
          });
        };
      }
    </script>
  `;
}
