export default function Home() {
  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">OMLOGISTIK</h1>

      <div className="mt-4 space-x-4">
        <a href="/login" className="text-blue-500">
          Login
        </a>
        <a href="/register" className="text-green-500">
          Register
        </a>
      </div>
    </div>
  );
}