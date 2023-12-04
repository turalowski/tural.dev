import Link from 'next/link';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs';

const projects_pronet = [
  {
    name: 'Prospect SMB',
    path: 'prospect.az',
    content:
      'is an ERP project which helps to manage businesses from one point. It is a module-based project which can be used separately. Each module of Prospect serves solutions in different areas like Users, Relations, Warehouses, Trades, Finance, HR, Orders, Call center, Reports, Tasks, and so on. The main stack in this project is React / Laravel and I have worked as a front-end developer. I get strong experience with React, Redux, Ant Design, async API calls, and so on. while working on this project.',
  },
  {
    name: 'ProCall',
    path: 'prospect.az',
    content:
      'is a web and desktop application that helps to handle and process calls in call centers. There are 5 call types Information, Suggestion, Order, Complaint, and Wrong are implemented and each call is stored in a database based on these types. Especially in the order type, customers can make orders with the help of customer service and this order will be processed in the Order module of the Prospect SMB project. These 2 projects run separately but are integrated. The main technologies which I used during the development of this project are React, React-Async, Electron.js, jssip, context API, Ant Design, and so on.',
  },
];

const projects_10be5 = [
  {
    name: 'SendCheck',
    path: '10be5.com',
    content:
      ' is the perfect Outlook add-in you are looking for. It is quick, intuitive, modern, and designed for and by professionals like you. It enables you to see instantly all recipients by organization and bulk move or delete them. You may also pre-load a working group list and save oft-used groupings of recipients from different organizations.',
  },
  {
    name: 'Takedown',
    path: '10be5.com',
    content:
      'is a fast, easy-to-use, self-serve document automation system. It enables you to populate placeholders across a set of documents. You may also use Takedown to create multiple versions of the same document. ',
  },
  {
    name: 'Circle-Up',
    path: '10be5.com',
    content:
      'Circle-Up is a game-changing application that automates the generation of auditor-friendly documents. Simply upload your offering document, and Circle-Up will identify and encircle financial numbers, making it easier for auditors to analyze and assess critical figures.',
  },
];

export default function WorkExperience() {
  return (
    <div>
      <h4 className="scroll-m-20 text-lg font-semibold tracking-tight mb-1">
        Work Experience
      </h4>
      <Tabs defaultValue="10be5" className="h-full w-full grow space-y-6">
        <div className="space-between flex items-center grow">
          <TabsList>
            <TabsTrigger value="10be5">2021-today</TabsTrigger>
            <TabsTrigger value="pronet">2019-2021</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="pronet" className="border-none p-0 outline-none">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Frontend developer
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Pronet LLC
              </h2>
              <p className="text-sm text-muted-foreground">
                I worked on 2 main projects during my journey:
              </p>
              {projects_pronet.map(project => (
                <p key={project.name} className="text-sm text-muted-foreground">
                  <Link href={project.path}>
                    <span className="underline underline-offset-1">
                      {project.name}
                    </span>
                  </Link>{' '}
                  {project.content}
                </p>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="10be5"
          className="h-full flex-col border-none p-0 data-[state=active]:flex"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Frontend developer
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">10BE5</h2>
              <p className="text-sm text-muted-foreground">
                I worked on 3 main projects in 10BE5 till today:
              </p>
              {projects_10be5.map(project => (
                <p key={project.name} className="text-sm text-muted-foreground">
                  <Link href={project.path}>
                    <span className="underline underline-offset-1">
                      {project.name}
                    </span>
                  </Link>{' '}
                  {project.content}
                </p>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
