export function StructuredData({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Prisma / other objects don't contain user input paths that could break here.
          // JSON.stringify escapes </script safely enough for typical content; if рискованно —
          // добавим replace on </script.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(d).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
