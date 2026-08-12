export function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.045]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNjAnIGhlaWdodD0nMTYwJz48ZmlsdGVyIGlkPSduJz48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC44NScgbnVtT2N0YXZlcz0nMicgc3RpdGNoVGlsZXM9J3N0aXRjaCcvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPScxNjAnIGhlaWdodD0nMTYwJyBmaWx0ZXI9J3VybCglMjNuKScvPjwvc3ZnPg==\")",
      }}
    />
  );
}
