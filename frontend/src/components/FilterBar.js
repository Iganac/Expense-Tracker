export default function FilterBar({ categoryId, onCategoryChange, sortBy, onSortChange, categories }){
  return (
    <div style={{display:"flex",gap:12,margin:"12px 0"}}>
      <select value={categoryId} onChange={e=>onCategoryChange(e.target.value)}>
        <option value="All">All Categories</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select value={sortBy} onChange={e=>onSortChange(e.target.value)}>
        <option value="dateDesc">Sort: Date ↓</option>
        <option value="amountDesc">Amount ↓</option>
        <option value="amountAsc">Amount ↑</option>
      </select>
    </div>
  );
}
