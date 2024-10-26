'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { ArrowLeftIcon, GitHubLogoIcon } from '@radix-ui/react-icons';

export default function PortfolioPage() {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const portfolioItems = [
    {
      id: 1,
      title: 'Technote Media',
      image: '/images/technote/main-dark.png',
      description: 'Landing Page | Dark Theme',
    },
    {
      id: 2,
      title: 'Technote Media',
      image: '/images/technote/post-dark.png',
      description: 'Post Page | Dark Theme',
    },
    {
      id: 3,
      title: 'Technote Media',
      image: '/images/technote/contact-dark.png',
      description: 'Contact Page | Dark Theme',
    },
    {
      id: 4,
      title: 'Prospect SMB',
      image: '/images/prospect/order/orders.jpg',
      description: 'Orders Module | List All Orders',
    },
    {
      id: 4,
      title: 'Prospect SMB',
      image: '/images/prospect/order/detail.png',
      description: 'Orders Module | Order Details',
    },
    {
      id: 5,
      title: 'Prospect SMB',
      image: '/images/prospect/sales/sales.jpg',
      description: 'Sales Module | List All Sales Operations',
    },
    {
      id: 6,
      title: 'Prospect SMB',
      image: '/images/prospect/sales/new-operation.png',
      description: 'Sales Module | New Sales Operation',
    },

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
        {portfolioItems.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div
              onClick={() => openFullscreen(item.image)}
              className="cursor-pointer"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={150}
                height={200}
                className="w-full h-40 object-contain object-center transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="p-2">
              <h2 className="text-sm font-semibold mb-1">{item.title}</h2>
              <p className="text-xs text-gray-600">{item.description}</p>
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
