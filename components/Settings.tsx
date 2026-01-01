import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your application settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>No client-side settings to manage at this time.</p>
      </CardContent>
    </Card>
  );
};

export default Settings;