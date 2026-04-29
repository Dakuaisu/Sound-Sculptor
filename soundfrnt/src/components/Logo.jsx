export default function Logo({ variant = 'header' }) {
  const className = variant === 'header' ? 'logo' : 'bodylogo'
  return (
    <div className={className}>
      <span className="musicwave"></span>
      <span className="musicwave"></span>
      <span className="musicwave"></span>
      <span className="musicwave"></span>
      <span className="musicwave"></span>
      <span className="musicwave"></span>
      <span className="musicwave"></span>
    </div>
  )
}
