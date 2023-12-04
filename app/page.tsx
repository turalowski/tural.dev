import Navbar from '@/app/components/navbar';
import ToggleAppearance from '@/app/components/toggle-appearance';
import Education from '@/app/components/education';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col  justify-start  p-6">
      <nav className="flex items-center justify-between ">
        <Navbar />
        <ToggleAppearance />
      </nav>
      <div className="flex flex-col my-3 gap-3">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Tural Hajiyev
        </h2>
        <Education />
        <div></div>
      </div>
    </main>
  );
}
