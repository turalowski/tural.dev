import Navbar from '@/app/components/navbar';
import ToggleAppearance from '@/app/components/toggle-appearance';
import Education from '@/app/components/education';
import WorkExperience from './components/work-experience';
import { TwitterLogoIcon, GitHubLogoIcon } from '@radix-ui/react-icons';
import { Button } from './components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col  justify-start  p-6">
      <nav className="flex items-center justify-between ">
        <Navbar />
        <div className="flex items-center gap-3">
          <Link target="_blank" href="https://twitter.com/turalowski">
            <Button variant="outline" size="icon">
              <TwitterLogoIcon />
              <span className="sr-only">Twitter</span>
            </Button>
          </Link>

          <Link target="_blank" href="https://github.com/turalowski">
            <Button variant="outline" size="icon">
              <GitHubLogoIcon />
              <span className="sr-only">Github</span>
            </Button>
          </Link>
          <ToggleAppearance />
        </div>
      </nav>
      <div className="flex flex-col my-3 gap-3">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Tural Hajiyev
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkExperience />
          <Education />
        </div>
      </div>
    </main>
  );
}
