import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Button, Group, Loader, Stack, Text } from "@mantine/core";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { fetchPublicSharedFlowRequest } from "../api/Flow/flows.api";

function toReadonlyNodes(nodes: any[]): Node[] {
  return nodes.map((node) => ({
    id: node.id,
    position: node.position,
    data: { label: node.data?.label || node.id },
    draggable: false,
    selectable: false,
    connectable: false,
    type: "default",
  }));
}

function toReadonlyEdges(edges: any[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: false,
    type: "default",
  }));
}

export function PublicSharedFlowPage() {
  const { shareId } = useParams();
  const [flowName, setFlowName] = useState<string>("");
  const [flowDescription, setFlowDescription] = useState<string>("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) {
      setError("Invalid share link");
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const shared = await fetchPublicSharedFlowRequest(shareId);
        if (!mounted) return;

        setFlowName(shared.flow.name || "Shared flow");
        setFlowDescription(shared.flow.description || "");
        setNodes(toReadonlyNodes(shared.flow.nodes || []));
        setEdges(toReadonlyEdges(shared.flow.edges || []));
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Could not load shared flow");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [shareId]);

  const stats = useMemo(() => ({
    nodes: nodes.length,
    edges: edges.length,
  }), [nodes.length, edges.length]);

  if (loading) {
    return (
      <Box p="xl" style={{ minHeight: "100vh", background: "#f8f4ec" }}>
        <Group justify="center" mt="xl">
          <Loader color="dark" />
        </Group>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="xl" style={{ minHeight: "100vh", background: "#f8f4ec" }}>
        <Stack gap="md" maw={680} mx="auto">
          <Text fw={800} size="lg" c="#2d3436">Shared flow unavailable</Text>
          <Text c="#2d3436" style={{ opacity: 0.8 }}>{error}</Text>
          <Button component={Link} to="/login" variant="light" color="dark" w="fit-content">
            Go to CapyFlow
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", background: "#f8f4ec" }}>
      <Box
        px="xl"
        py="md"
        style={{
          borderBottom: "2px solid #2d3436",
          background: "#fff8f0",
        }}
      >
        <Stack gap={4}>
          <Text fw={900} size="lg" c="#2d3436">{flowName}</Text>
          {flowDescription && (
            <Text size="sm" c="#2d3436" style={{ opacity: 0.8 }}>{flowDescription}</Text>
          )}
          <Text size="xs" c="#2d3436" style={{ opacity: 0.6 }}>
            Read-only shared view · {stats.nodes} nodes · {stats.edges} connections
          </Text>
        </Stack>
      </Box>

      <Box style={{ height: "calc(100vh - 110px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap pannable zoomable />
          <Controls showInteractive={false} />
          <Background />
        </ReactFlow>
      </Box>
    </Box>
  );
}
