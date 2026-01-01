import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Stats from "@/components/Stats";
import Settings from "@/components/Settings";
import NotesManager from "@/components/NotesManager";

const DashboardPage = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Tabs defaultValue="stats" className="mt-4">
        <TabsList>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="notes">Manage Notes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="stats">
          <Stats />
        </TabsContent>
        <TabsContent value="notes">
          <NotesManager />
        </TabsContent>
        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
