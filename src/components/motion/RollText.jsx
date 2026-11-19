/**
 * Teks yang "menggulung" saat induknya (class `group`) disorot atau difokus keyboard:
 * tulisan naik keluar, salinannya naik masuk dari bawah. Murni CSS (lihat .roll di index.css).
 */
export function RollText({ children }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}
