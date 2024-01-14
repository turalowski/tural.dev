import { TwitterLogoIcon, GitHubLogoIcon } from '@radix-ui/react-icons';
import { IoDocumentText } from 'react-icons/io5';
import { Button } from './components/ui/button';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './components/ui/tooltip';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col  justify-center items-center p-6">
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
          {/* <TooltipProvider> */}
          {/*   <Tooltip> */}
          {/*     <TooltipTrigger asChild> */}
          {/*       <Link target="_blank" href="https://github.com/turalowski"> */}
          {/*         <Button variant="outline" size="icon"> */}
          {/*           <IoDocumentText /> */}
          {/*           <span className="sr-only">Github</span> */}
          {/*         </Button> */}
          {/*       </Link> */}
          {/*     </TooltipTrigger> */}
          {/*     <TooltipContent>CV</TooltipContent> */}
          {/*   </Tooltip> */}
          {/* </TooltipProvider> */}
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
        </div>
      </div>
    </main>
  );
}
