'use client';

import { TwitterLogoIcon, GitHubLogoIcon, SunIcon, MoonIcon } from '@radix-ui/react-icons';
import { Button } from './components/ui/button';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './components/ui/tooltip';
import { useTheme } from 'next-themes';

export default function Home() {
  const { theme, setTheme } = useTheme();

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link target="_blank" href="https://twitter.com/turalowski">
                  <Button variant="outline" size="icon">
                    <TwitterLogoIcon />
                    <span className="sr-only">Twitter</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Twitter</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </main>
  );
}
