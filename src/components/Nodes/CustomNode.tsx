export const CustomNode = memo(function CustomNode({
  id,
  data,
  selected,
}: NodeProps) {
  const Icon = getCachedIcon((data as NodeData).icon || "IconBolt");
  const { deleteNode, duplicateNode } = useFlowActions();

  const [showDelete, setShowDelete] = useState(selected);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  const {
    node,
    topBar,
    icon,
    content,
    mainContent,
    handleTarget,
    handleSource,
    handleLabel,
    actionBtn,
    colors,
  } = useMemo(
    () =>
      getStyles(
        !!selected,
        (data as NodeData).executionStatus || "idle",
        (data as NodeData).color
      ),
    [selected, (data as NodeData).executionStatus, (data as NodeData).color]
  );

  useEffect(() => {
    if (selected) {
      setShowDelete(true);
    } else {
      timeoutRef.current = window.setTimeout(
        () => setShowDelete(false),
        200
      );
      return () => clearTimeout(timeoutRef.current);
    }
  }, [selected]);

  const handleDelete = useCallback(() => {
    deleteNode(id as string);
    setConfirmOpen(false);
  }, [deleteNode, id]);

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      duplicateNode(id as string);
    },
    [duplicateNode, id]
  );

  const nodeData = data as NodeData;

  return (
    <div style={{ width: 240, position: "relative" }} className="node-container">
      
      {/* ACTION BUTTONS */}
      {showDelete && (
        <div
          style={{
            position: "absolute",
            top: -50,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
          }}
        >
          <div style={actionBtn} onClick={handleDuplicate}>
            <IconCopy size={18} color={colors.textPrimary} />
          </div>

          <div style={actionBtn} onClick={handleDelete}>
            <IconTrash size={18} color={colors.errorColor} />
          </div>
        </div>
      )}

      {/* INPUT HANDLE (condicional para triggers) */}
      {nodeData.type !== "manual-trigger" &&
        nodeData.category !== "trigger" && (
          <>
            <div
              style={{
                ...handleLabel,
                top: -18,
                left: "50%",
                transform: "translateX(-50%)",
                color: "#3b82f6",
              }}
            >
              ▼ INPUT
            </div>

            <Handle
              type="target"
              position={Position.Top}
              style={handleTarget}
              className="handle-target"
            />
          </>
        )}

      {/* NODE BODY */}
      <div style={node}>
        <div style={topBar} />
        <div style={content}>
          <div style={mainContent}>
            <div style={icon}>
              <Icon size={22} color={colors.textPrimary} />
            </div>
            <Text size="sm">{nodeData.label}</Text>
          </div>

          {nodeData.executionStatus &&
            nodeData.executionStatus !== "idle" && (
              <NodeExecutionStatus
                status={nodeData.executionStatus as any}
              />
            )}
        </div>

        {/* OUTPUTS */}
        {nodeData.type === "if-condition" ? (
          <>
            {/* TRUE */}
            <div
              style={{
                ...handleLabel,
                bottom: -20,
                left: "35%",
                transform: "translateX(-50%)",
                color: "#10b981",
              }}
            >
              ▼ TRUE
            </div>

            <Handle
              type="source"
              position={Position.Bottom}
              id="true"
              style={{ ...handleSource, left: "35%", background: "#10b981" }}
              className="handle-source"
            />

            {/* FALSE */}
            <div
              style={{
                ...handleLabel,
                bottom: -20,
                left: "65%",
                transform: "translateX(-50%)",
                color: "#f43f5e",
              }}
            >
              ▼ FALSE
            </div>

            <Handle
              type="source"
              position={Position.Bottom}
              id="false"
              style={{ ...handleSource, left: "65%", background: "#f43f5e" }}
              className="handle-source"
            />
          </>
        ) : (
          <>
            <div
              style={{
                ...handleLabel,
                bottom: -20,
                left: "50%",
                transform: "translateX(-50%)",
                color: "#10b981",
              }}
            >
              ▼ OUTPUT
            </div>

            <Handle
              type="source"
              position={Position.Bottom}
              style={handleSource}
              className="handle-source"
            />
          </>
        )}
      </div>
    </div>
  );
});
