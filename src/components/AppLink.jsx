export default function AppLink({ href, children, ...props }) {
  function navigate(event) { if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return; event.preventDefault(); window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); }
  return <a href={href} onClick={navigate} {...props}>{children}</a>;
}
