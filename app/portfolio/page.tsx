'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

const galleryItems = [
  {
    src: '/images/orders.jpg',
    thumbnail: '/images/orders.jpg',
    alt: 'Orders',
    subHtml: '<h4>Prospect ERP</h4><p>Orders module to manage and track orders</p>',
  },
  {
    src: '/images/orders-detail.png',
    thumbnail: '/images/orders-detail.png',
    alt: 'Image 3',
    subHtml: '<h4>Image 3</h4><p>Description for Image 3</p>',
  },
  {
    src: '/images/sales.jpg',
    thumbnail: '/images/sales.jpg',
    alt: 'Image 4',
    subHtml: '<h4>Image 4</h4><p>Description for Image 4</p>',
  },
  {
    src: '/images/trade-operation-detail.png',
    thumbnail: '/images/trade-operation-detail.png',
    alt: 'Trade Operation Detail',
    subHtml: '<h4>Trade Operation Detail</h4><p>Detailed view of trade operations</p>',
  },
  {
    src: '/images/new-operation.png',
    thumbnail: '/images/new-operation.png',
    alt: 'New Operation',
    subHtml: '<h4>New Operation</h4><p>Interface for creating a new operation</p>',
  },
  {
    src: '/images/make-payment.png',
    thumbnail: '/images/make-payment.png',
    alt: 'Make Payment',
    subHtml: '<h4>Make Payment</h4><p>Interface for making payments</p>',
  },
  // Add more items as needed
];

const CarouselSize = () => {
  const [selectedImage, setSelectedImage] = useState(galleryItems[0]);
  const [api, setApi] = React.useState<CarouselApi>()
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) {
      return
    }
 
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    })
  }, [api])

  useEffect(() => {
    setSelectedImage(galleryItems[currentIndex]);
  }, [currentIndex]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 overflow-visible gap-24">
   <div className='text-center'>
   <h1 className="text-3xl font-bold mb-2">Prospect ERP - Sales Module</h1>
    <p className="text-base mb-6">Create, manage, and analyze sales operations with detailed insights and efficient workflows.</p>
      <div className="mb-4 w-full h-[500px] relative">
        <Image
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          style={{ objectFit: 'contain' }}
          className="w-full h-full"
        />
      </div>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full max-w-4xl"
        setApi={setApi}
      >
        <CarouselContent>
          {galleryItems.map((item, index) => (
            <CarouselItem key={index} className="basis-1/6">
              <div className="p-1">
                <Card>
                  <CardContent 
                    className="flex aspect-square items-center justify-center p-2 cursor-pointer"
                    onClick={() => {
                      setSelectedImage(item);
                      api?.scrollTo(index);
                    }}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={item.thumbnail}
                        alt={item.alt}
                        layout="fill"
                        objectFit="contain"
                        className="max-h-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
   </div>

   <div className='text-center'>
   <h1 className="text-3xl font-bold mb-2">Prospect ERP - Finance Module</h1>
    <p className="text-base mb-6">Create, manage, and analyze finance operations with detailed insights and efficient workflows.</p>
      <div className="mb-4 w-full h-[500px] relative">
        <Image
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          style={{ objectFit: 'contain' }}
          className="w-full h-full"
        />
      </div>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full max-w-4xl"
        setApi={setApi}
      >
        <CarouselContent>
          {galleryItems.map((item, index) => (
            <CarouselItem key={index} className="basis-1/6">
              <div className="p-1">
                <Card>
                  <CardContent 
                    className="flex aspect-square items-center justify-center p-2 cursor-pointer"
                    onClick={() => {
                      setSelectedImage(item);
                      api?.scrollTo(index);
                    }}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={item.thumbnail}
                        alt={item.alt}
                        layout="fill"
                        objectFit="contain"
                        className="max-h-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
   </div>
      
    </div>
  );
}

export default CarouselSize;