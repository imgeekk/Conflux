"use client";

import { useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { GearIcon, CheckCircleIcon, WarningOctagonIcon } from "@phosphor-icons/react";
import Loader from "@/components/Loader";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";

export default function SettingsPage() {
    const { workspace } = useWorkspace();
    const [apiKey, setApiKey] = useState("");
    const [success, setSuccess] = useState(false);
    const { data: settings, isLoading, error: settingsError } = useSettings(workspace?.id ?? "");
    const { mutate: updateSettings, isPending, error: updateError } = useUpdateSettings(workspace?.id ?? "");

    async function handleSave() {
        if (!apiKey.trim()) return;
        updateError && (updateError.message = "");
        updateSettings({ apiKey }, {
            onSuccess: () => {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            },
        });
    }

    async function handleRemove() {
        updateError && (updateError.message = "");
        updateSettings({ apiKey: null });
    }

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (settingsError) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-destructive">Error loading settings: {settingsError.message}</p>
            </div>
        );
    }

    return (
        <div className="w-2xl mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-2">
                <GearIcon className="w-6 h-6 text-chart-2" />
                <h1 className="text-xl font-semibold">Settings</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Gemini API Key</CardTitle>
                    <CardDescription>
                        Provide your own Gemini API key for your team to use search and
                        Q&A. Without a key, the workspace is limited to 50 queries per
                        month.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {settings?.isOwner === false && (
                        <p className="text-xs text-destructive">
                            Only the workspace owner can manage the API key.
                        </p>
                    )}
                    {settings?.hasApiKey ? (
                        <div className={`flex items-center ${settings.isOwner ? 'justify-between' : 'justify-start'}`}>
                            <div className="flex items-center gap-2 text-sm text-chart-2">
                                <CheckCircleIcon className="w-4 h-4" />
                                API key is already configured
                            </div>
                            {settings.isOwner && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleRemove}
                                    disabled={isPending || !settings?.isOwner}
                                    className="w-22"
                                >
                                    {isPending ? (
                                        <Spinner className="w-3.5 h-3.5" />
                                    ) : (
                                        "Remove key"
                                    )}
                                </Button>
                            )}
                        </div>
                    ) : (settings?.isOwner ? (
                        <>
                            <div className="rounded border border-border p-3 text-xs text-muted-foreground space-y-1">
                                <p>
                                    Get your API key from{" "}
                                    <a
                                        href="https://aistudio.google.com/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-foreground underline underline-offset-2"
                                    >
                                        Google AI Studio
                                    </a>
                                    .
                                </p>
                                <p>
                                    The key is encrypted and stored securely. It is only used for
                                    API calls made by members of this workspace.
                                </p>
                            </div>
                            <Input
                                type="password"
                                placeholder="Paste your Gemini API key"
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    updateError && (updateError.message = "");
                                }}
                                disabled={isPending || !settings?.isOwner}
                            />
                            {updateError && updateError.message && (
                                <p className="text-xs text-destructive">{updateError.message}</p>
                            )}
                            {success && (
                                <p className="text-xs text-chart-2">
                                    Saved successfully!
                                </p>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={isPending || !settings?.isOwner || !apiKey.trim()}
                                className="w-20"
                            >
                                {isPending ? (
                                    <Spinner className="w-3.5 h-3.5" />
                                ) : (
                                    "Save key"
                                )}
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <WarningOctagonIcon className="w-4 h-4" />
                            API key is not yet configured.
                        </div>
                    )
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
