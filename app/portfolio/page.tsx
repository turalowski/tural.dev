'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { ArrowLeftIcon, GitHubLogoIcon } from '@radix-ui/react-icons';

export default function PortfolioPage() {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const portfolioProjects = [
    {
      id: 1,
      title: 'Technote Media (Frontend)',
      images: [
        {
          src: '/images/technote/main-dark.png',
          description: 'Landing Page | Dark Theme',
        },
        {
          src: '/images/technote/post-dark.png',
          description: 'Post Page | Dark Theme',
        },
        {
          src: '/images/technote/contact-dark.png',
          description: 'Contact Page | Dark Theme',
        },
      ],
    },
    {
      id: 2,
      title: 'Prospect SMB (Frontend)',
      images: [
        {
          src: '/images/prospect/order/orders.jpg',
          description: 'Orders Module | List All Orders',
        },
        {
          src: '/images/prospect/order/detail.png',
          description: 'Orders Module | Order Details',
        },
        {
          src: '/images/prospect/sales/sales.jpg',
          description: 'Sales Module | List All Sales Operations',
        },
        {
          src: '/images/prospect/sales/new-operation.png',
          description: 'Sales Module | New Sales Operation',
        },
      ],
    },
    {
        id: 3,
        title: 'TOLQ - Email Archive (Design)',
        images: [
            {
                src: '/images/tolq/main.png',
                description: 'Show All Emails'
            },
            {
                src: '/images/tolq/archive.png',
                description: 'Show All Archives'
            },
            {
                src: '/images/tolq/content.png',
                description: 'Show Content',
            },
            {
                src: '/images/tolq/forward-email.png',
                description: 'Forward Email',
            }
        ]
    }
    // Add more projects as needed
  ];

  const openFullscreen = (image: string) => {
    setFullscreenImage(image);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon">
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">My Portfolio</h1>
        <Button variant="outline" size="icon" className="ml-auto">
          <GitHubLogoIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8">
        {portfolioProjects.map(project => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">{project.title}</h2>
              <div className="grid grid-cols-2 gap-4">
                {project.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => openFullscreen(image.src)}
                    className="cursor-pointer"
                  >
                    <Image
                      src={image.src}
                      alt={`${project.title} - ${image.description}`}
                      width={100}
                      height={75}
                      className="w-full h-12 object-cover object-center transition-transform duration-300 hover:scale-105"
                    />
                    <p className="text-xs text-gray-600 mt-2">{image.description}</p>
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
          <Image
            src={fullscreenImage}
            alt="Fullscreen image"
            layout="fill"
            objectFit="contain"
          />
        </div>
      )}
    </div>
  );
}
