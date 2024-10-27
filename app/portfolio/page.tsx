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
    {
      id: 7,
      title: 'Tender',
      images: [
        {
          src: '/images/tender/home.png',
          description: 'Landing Page',
        },
        {
          src: '/images/tender/categories.png',
          description: 'Browse Categories',
        },
        {
          src: '/images/tender/about-tender.png',
          description: 'About Us',
        },
        {
          src: '/images/tender/create-tender.png',
          description: 'New Tender Form',
        },
      ],
    },
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

  const openFullscreen = (image: string) => {
    setFullscreenImage(image);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => window.location.href = '/'}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">My Portfolio</h1>
        <Button variant="outline" size="icon" className="ml-auto" onClick={() => window.location.href = 'https://github.com/turalowski'}>
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
              <h2 className="text-md font-semibold mb-4">{project.title}</h2>
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
                    <p className="text-xs text-gray-600 mt-2">
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
