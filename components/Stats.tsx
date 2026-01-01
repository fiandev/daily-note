import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Visitor = {
    geo: string;
    browser: string;
    os: string;
    timestamp: string;
};

type AggregatedData = {
    name: string;
    visitors: number;
};

const Stats = () => {
    const [data, setData] = useState<AggregatedData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVisitorData = async () => {
            try {
                const response = await fetch("/api/visitor");
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch visitor data");
                }
                const visitors: Visitor[] = await response.json();

                // Aggregate data
                const counts = visitors.reduce((acc, visitor) => {
                    acc[visitor.geo] = (acc[visitor.geo] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const aggregatedData = Object.entries(counts).map(([name, visitors]) => ({
                    name,
                    visitors,
                }));

                setData(aggregatedData);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVisitorData();
    }, []);

    if (loading) {
        return <p>Loading stats...</p>;
    }

    if (error) {
        return <p>Error loading stats: {error}</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Visitors by Country</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="visitors" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default Stats;