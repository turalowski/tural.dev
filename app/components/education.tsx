import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs';

export default function Education() {
  return (
    <div className="flex flex-col">
      <h4 className="scroll-m-20  text-lg font-semibold tracking-tight mb-1">
        Education
      </h4>
      <Tabs defaultValue="master" className="h-full w-full grow space-y-6">
        <div className="space-between flex items-center grow">
          <TabsList>
            <TabsTrigger value="master" className="relative">
              master
            </TabsTrigger>
            <TabsTrigger value="bachelor">bachelor</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="master" className="border-none p-0 outline-none">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Computer Engineering | 2021-2023
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Wroclaw University of Science and Technology
              </h2>
              <p className="text-sm text-muted-foreground">
                computer project management, information system modelling,
                electronic media in business and commerce, research skills and
                methodologies, advanced databases, application development -
                java and xml technologies, information systems analysis,
                multimedia and computer visualization, secure systems and
                networks, data mining and data warehousing, application
                programming - mobile programming.
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="bachelor"
          className="h-full flex-col border-none p-0 data-[state=active]:flex"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Information Technologies | 2016-2020
              </p>

              <h2 className="text-2xl font-semibold tracking-tight">
                Azerbaijan State Oil and Industry University
              </h2>
              <p className="text-sm text-muted-foreground">
                introduction to information technologies, computer architecture,
                operation systems, data structure and algorithms, multimedia
                technologies, basics of database, technologies of information
                security, object-oriented programming, information systems,
                introduction to computer networks, system engineering, basics of
                management.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
