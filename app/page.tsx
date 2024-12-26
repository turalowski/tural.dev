'use client';

import { GitHubLogoIcon, FileTextIcon } from '@radix-ui/react-icons';
import { Button } from './components/ui/button';
import Link from 'next/link';
import ToggleAppearance from './components/toggle-appearance';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './components/ui/tooltip';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-center items-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div>Hello, I am Tural 👋</div>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link target="_blank" href="https://github.com/turalowski">
                  <Button variant="outline" size="icon">
                    <GitHubLogoIcon />
                    <span className="sr-only">Github</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>GitHub</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/blog">
                  <Button variant="outline" size="icon">
                    <FileTextIcon />
                    <span className="sr-only">Blog</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Blog</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/portfolio">
                  <Button variant="outline" size="icon">
                    <span>📁</span>
                    <span className="sr-only">Portfolio</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Portfolio</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ToggleAppearance />
        </div>
      </div>
    </main>
  );
}
