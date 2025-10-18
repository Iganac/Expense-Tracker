export default function TotalsSummary({ total, byCategory, nameById }){
  return (
    <div>
      <p><strong>Total:</strong> ${total.toFixed(2)}</p>
      <h3>By Category</h3>
      <ul>
        {Object.entries(byCategory).map(([cid, v]) => (
          <li key={cid}>{nameById.get(cid) || cid}: ${v.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
}
