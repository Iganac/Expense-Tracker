export default function Button({ variant="default", ...props }){
  const cls = "btn" + (variant==="primary" ? " primary" : "");
  return <button className={cls} {...props} />;
}
