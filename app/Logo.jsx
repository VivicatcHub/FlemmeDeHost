export default function Logo({ size, res = 128, alt = "" }) {
  return (
    <picture>
      <source
        srcSet={`/logo-dark-${res}.png`}
        media="(prefers-color-scheme: dark)"
      />
      <img src={`/logo-${res}.png`} alt={alt} width={size} height={size} />
    </picture>
  );
}
