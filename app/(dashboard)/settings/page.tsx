"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/components/shared/ui/Card";
import { ThemeToggle } from "@/app/components/shared/ui/ThemeToggle";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Profile details are managed via Clerk. Click your avatar to update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex justify-between text-small">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{user?.fullName ?? "—"}</dd>
            </div>
            <div className="flex justify-between text-small">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">
                {user?.primaryEmailAddress?.emailAddress ?? "—"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose your preferred theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-small">Dark mode</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
