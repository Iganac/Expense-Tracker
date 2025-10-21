export default function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      color:"#991b1b", background:"#fee2e2", border:"1px solid #fecaca",
      borderRadius:12, padding:10, marginBottom:8
    }}>
      {msg}
    </div>
  );
}