'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import {
  ArrowLeftIcon,
  GitHubLogoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
} from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';

export default function PortfolioPage() {
  const { theme, setTheme } = useTheme();
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const portfolioProjects = [
    {
      id: 1,
      title: 'Technote Media',
      images: [
        {
          src: '/images/technote/main-dark.png',
          description: 'Home Page (Dark Theme)',
        },
        {
          src: '/images/technote/main-light.png',
          description: 'Home Page (Light Theme)',
        },
        {
          src: '/images/technote/post-dark.png',
          description: 'Blog Post (Dark Theme)',
        },
        {
          src: '/images/technote/post-light.png',
          description: 'Blog Post (Light Theme)',
        },
      ],
    },
    {
      id: 5.5,
      title: 'Job Searching Platform',
      images: [
        {
          src: '/images/projobs/main.png',
          description: 'Homepage',
        },
        {
          src: '/images/projobs/jobs.png',
          description: 'Jobs Listing',
        },
        {
          src: '/images/projobs/job-detail.png',
          description: 'Job Details',
        },
      ],
    },
    {
      id: 2,
      title: 'Prospect SMB - Contacts Module',
      images: [
        {
          src: '/images/prospect/contacts/contacts.png',
          description: 'Contacts Dashboard',
        },
        {
          src: '/images/prospect/contacts/new-contact.png',
          description: 'Create Contact Form',
        },
        {
          src: '/images/prospect/contacts/partners.png',
          description: 'Partners List',
        },
        {
          src: '/images/prospect/contacts/new-partner.png',
          description: 'Create Partner Form',
        },
      ],
    },
    {
      id: 3,
      title: 'Prospect SMB - Orders Module',
      images: [
        {
          src: '/images/prospect/orders-module/list-of-goods.png',
          description: 'Products Catalog',
        },
        {
          src: '/images/prospect/orders-module/orders.jpg',
          description: 'Orders Dashboard',
        },
        {
          src: '/images/prospect/orders-module/detail.png',
          description: 'Order Information',
        },
        {
          src: '/images/prospect/orders-module/timeline.png',
          description: 'Order Status Timeline',
        },
      ],
    },
    {
      id: 4,
      title: 'Prospect SMB - Sales Module',
      images: [
        {
          src: '/images/prospect/sales/sales.jpg',
          description: 'Sales Dashboard',
        },
        {
          src: '/images/prospect/sales/new-operation.png',
          description: 'Create Sale',
        },
        {
          src: '/images/prospect/sales/detail.png',
          description: 'Sale Details',
        },
        {
          src: '/images/prospect/sales/invoice-content.png',
          description: 'Invoice Preview',
        },
      ],
    },
    {
      id: 5,
      title: 'Prospect SMB - Reports Module',
      images: [
        {
          src: '/images/prospect/reports/sales-reports.png',
          description: 'Sales Analytics',
        },
        {
          src: '/images/prospect/reports/turnover.png',
          description: 'Revenue Overview',
        },
        {
          src: '/images/prospect/reports/balance-sheet.png',
          description: 'Balance Sheet',
        },
        {
          src: '/images/prospect/reports/balance-sheet-range.png',
          description: 'Custom Date Range',
        },
      ],
    },
    {
      id: 6,
      title: '10BE5 - Landing Page',
      images: [
        {
          src: '/images/10be5/home.png',
          description: 'Welcome Page',
        },
        {
          src: '/images/10be5/product.png',
          description: 'Product Details',
        },
        {
          src: '/images/10be5/contact.png',
          description: 'Get in Touch',
        },
      ],
    },
    // {
    //   id: 7,
    //   title: 'Tender',
    //   images: [
    //     {
    //       src: '/images/tender/home.png',
    //       description: 'Landing Page',
    //     },
    //     {
    //       src: '/images/tender/categories.png',
    //       description: 'Browse Categories',
    //     },
    //     {
    //       src: '/images/tender/about-tender.png',
    //       description: 'About Us',
    //     },
    //     {
    //       src: '/images/tender/create-tender.png',
    //       description: 'New Tender Form',
    //     },
    //   ],
    // },
    {
      id: 8,
      title: 'Email Archive',
      images: [
        {
          src: '/images/tolq/main.png',
          description: 'Email Inbox',
        },
        {
          src: '/images/tolq/archive.png',
          description: 'Archived Emails',
        },
        {
          src: '/images/tolq/content.png',
          description: 'Email Content',
        },
        {
          src: '/images/tolq/forward-email.png',
          description: 'Forward Message',
        },
      ],
    },
    // Add more projects as needed
  ];

  const openFullscreen = (projectIndex: number, imageIndex: number) => {
    setCurrentProjectIndex(projectIndex);
    setCurrentImageIndex(imageIndex);
    setFullscreenImage(portfolioProjects[projectIndex].images[imageIndex].src);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const currentProject = portfolioProjects[currentProjectIndex];
    let newImageIndex = currentImageIndex;

    if (direction === 'next') {
      if (newImageIndex < currentProject.images.length - 1) {
        newImageIndex++;
      } else if (currentProjectIndex < portfolioProjects.length - 1) {
        setCurrentProjectIndex(currentProjectIndex + 1);
        newImageIndex = 0;
      }
    } else {
      if (newImageIndex > 0) {
        newImageIndex--;
      } else if (currentProjectIndex > 0) {
        setCurrentProjectIndex(currentProjectIndex - 1);
        newImageIndex =
          portfolioProjects[currentProjectIndex - 1].images.length - 1;
      }
    }

    setCurrentImageIndex(newImageIndex);
    setFullscreenImage(
      portfolioProjects[currentProjectIndex].images[newImageIndex].src
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullscreenImage) return;

      if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'Escape') {
        closeFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage, currentProjectIndex, currentImageIndex]);

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => (window.location.href = '/')}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">My Portfolio</h1>
        <div className="ml-auto flex gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              (window.location.href = 'https://github.com/turalowski')
            }
          >
            <GitHubLogoIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8">
        {portfolioProjects.map((project, projectIndex) => (
          <div
            key={project.id}
            className="bg-background rounded-lg shadow-md overflow-hidden dark:border dark:border-gray-700"
          >
            <div className="p-4">
              <h2 className="text-md font-semibold mb-4">{project.title}</h2>
              <div className="grid grid-cols-2 gap-4">
                {project.images.map((image, imageIndex) => (
                  <div
                    key={imageIndex}
                    onClick={() => openFullscreen(projectIndex, imageIndex)}
                    className="cursor-pointer"
                  >
                    <Image
                      src={image.src}
                      alt={`${project.title} - ${image.description}`}
                      width={100}
                      height={75}
                      objectFit="cover"
                      objectPosition="center"
                      className="w-full h-12 transition-transform duration-300 hover:scale-105"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {image.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeFullscreen}
        >
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 z-50"
            onClick={e => {
              e.stopPropagation();
              navigateImage('prev');
            }}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Image
            src={fullscreenImage}
            alt="Fullscreen image"
            layout="fill"
            objectFit="contain"
          />
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 z-50"
            onClick={e => {
              e.stopPropagation();
              navigateImage('next');
            }}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
