export default function preventBubble(handler) {
  return (event) => {
    event.stopPropagation();
    handler(event);
  };
}
