"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  FolderOpen, 
  Folder,
  Info,
  ArrowUpDown,
  Move,
  GripVertical,
  FolderInput,
  Edit,
  MoreHorizontal,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { UploadTrainingButton } from "./upload-training-button"
import { AddFolderButton } from "./add-folder-button"
import { MoveFolderDialog } from "./move-folder-dialog"
import { MoveDocumentDialog } from "./move-document-dialog"
import { EditFolderDialog } from "./edit-folder-dialog"

// Import react-beautiful-dnd for drag-and-drop functionality
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DropResult,
  DraggableStateSnapshot
} from "react-beautiful-dnd"

interface Document {
  id: string
  title: string
  fileUrl: string
  fileSize: number
  skillLevel: number
  requirements?: string
  updatedAt: string
  ord?: number
  folderId: string
}

interface Folder {
  id: string
  name: string
  description?: string
  documents: Document[]
  subFolders: Folder[]
  parentId: string | null
  ord?: number
}

// Recursive function to flatten the folder hierarchy
function getAllFoldersFlattened(folders: Folder[]): Folder[] {
  let allFolders: Folder[] = [];
  
  function traverse(folder: Folder) {
    allFolders.push(folder);
    if (folder.subFolders && folder.subFolders.length > 0) {
      folder.subFolders.forEach(subFolder => traverse(subFolder));
    }
  }
  
  folders.forEach(folder => traverse(folder));
  return allFolders;
}

type SortField = "title" | "skillLevel" | "fileSize" | "updatedAt"
type SortDirection = "asc" | "desc"

function DocumentsTable({ 
  documents, 
  folderId,
  onReorder,
  allFolders
}: { 
  documents: Document[], 
  folderId: string,
  onReorder: (items: Document[]) => void,
  allFolders: Folder[]
}) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [sortField, setSortField] = useState<SortField>("updatedAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Move document up using API
  const moveDocumentUpMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch("/api/admin/training/reorder-single", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          direction: "up"
        }),
      });
      if (!response.ok) throw new Error("Failed to move document up");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-folders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move document up",
        variant: "destructive",
      });
    }
  });

  // Move document down using API
  const moveDocumentDownMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch("/api/admin/training/reorder-single", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          direction: "down"
        }),
      });
      if (!response.ok) throw new Error("Failed to move document down");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-folders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move document down",
        variant: "destructive",
      });
    }
  });

  if (!documents || documents.length === 0) {
    return null;
  }

  // Sort documents based on current sort criteria
  const sortedDocuments = [...documents]

  // Toggle sort direction or change sort field
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle drag end for documents
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(sortedDocuments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    
    onReorder(items);
  };

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const response = await fetch(`/api/admin/training/${docId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-folders"] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  });

  return (
    <Card>
      <CardContent className="p-0">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead> {/* Handle column */}
                <TableHead>Titel</TableHead>
        
                <TableHead>Skill
                </TableHead>
                <TableHead>
                  Vorraussetzungen
                </TableHead>
                
                <TableHead className="text-right pr-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Droppable droppableId={`documents-${folderId}`}>
              {(provided: DroppableProvided) => (
                <TableBody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {sortedDocuments.map((doc, index) => (
                    <Draggable key={doc.id} draggableId={doc.id} index={index}>
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <TableRow 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(snapshot.isDragging ? "bg-accent opacity-80" : "")}
                        >
                          <TableCell className="w-8">
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab flex items-center justify-center"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {doc.title}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "text-white",
                              doc.skillLevel <= 2 ? "bg-green-500" :
                              doc.skillLevel <= 4 ? "bg-yellow-500" :
                              "bg-red-500"
                            )}>
                              Level {doc.skillLevel}
                            </Badge>
                          </TableCell>
                          <TableCell><p className="max-w-xs whitespace-normal">{doc.requirements}</p></TableCell>
                          <TableCell className="float-right pr-5">
                            <div className="flex items-center gap-2 ">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={index === 0}
                                onClick={() => moveDocumentUpMutation.mutate(doc.id)}
                                className={index === 0 || moveDocumentUpMutation.isPending ? "opacity-50" : ""}
                              >
                                <ArrowUp className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={index === sortedDocuments.length - 1}
                                onClick={() => moveDocumentDownMutation.mutate(doc.id)}
                                className={index === sortedDocuments.length - 1 || moveDocumentDownMutation.isPending ? "opacity-50" : ""}
                              >
                                <ArrowDown className="h-4 w-4 text-blue-500" />
                              </Button>
                              <MoveDocumentDialog
                                document={doc}
                                allFolders={allFolders}
                                currentFolderId={folderId}
                                trigger={
                                  <Button variant="ghost" size="sm">
                                    <FolderInput className="h-4 w-4 text-blue-500" />
                                  </Button>
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a')
                                  link.href = doc.fileUrl
                                  link.download = doc.title
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this document? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(doc.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
      </CardContent>
    </Card>
  )
}

function FolderTree({ 
  folder, 
  allFolders,
  onFolderReorder,
  onDocumentReorder
}: { 
  folder: Folder,
  allFolders: Folder[],
  onFolderReorder: (folderId: string, items: Folder[]) => void,
  onDocumentReorder: (folderId: string, items: Document[]) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const hasContents = (folder.documents?.length ?? 0) > 0 || (folder.subFolders?.length ?? 0) > 0
  
  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const response = await fetch(`/api/admin/folders/${folderId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete folder");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-folders"] });
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  });

  // Move folder up using API
  const moveFolderUpMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const response = await fetch("/api/admin/folders/reorder-single", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId,
          direction: "up"
        }),
      });
      if (!response.ok) throw new Error("Failed to move folder up");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-folders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move folder up",
        variant: "destructive",
      });
    }
  });

  // Move folder down using API
  const moveFolderDownMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const response = await fetch("/api/admin/folders/reorder-single", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId,
          direction: "down"
        }),
      });
      if (!response.ok) throw new Error("Failed to move folder down");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-folders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move folder down",
        variant: "destructive",
      });
    }
  });
  
  // Sort subfolders by their ord property
  const sortedSubFolders = [...(folder.subFolders || [])].sort((a, b) => 
    (a.ord || 0) - (b.ord || 0)
  );

  // Handle drag end for subfolders
  const handleSubFolderDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(sortedSubFolders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the ord property of each item
    const itemsWithOrder = items.map((item, index) => ({
      ...item,
      ord: index
    }));
    
    onFolderReorder(folder.id, itemsWithOrder);
  };

  // Handle document reordering
  const handleDocumentReorder = (reorderedDocs: Document[]) => {
    onDocumentReorder(folder.id, reorderedDocs);
  };

  return (
    <div className="space-y-2 border border-border rounded-md p-2 bg-card">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="justify-start hover:bg-accent flex-1 text-left"
          onClick={() => setIsOpen(!isOpen)}
        >
          {hasContents ? (
            isOpen ? (
              <ChevronDown className="mr-2 h-4 w-4" />
            ) : (
              <ChevronRight className="mr-2 h-4 w-4" />
            )
          ) : (
            <span className="w-4 mr-2" />
          )}
          {isOpen ? (
            <FolderOpen className="mr-2 h-4 w-4" />
          ) : (
            <Folder className="mr-2 h-4 w-4" />
          )}
          {folder.name}
          {folder.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-2 h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{folder.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Button>
        <div className="flex items-center">
          <EditFolderDialog
            folder={folder}
            trigger={
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => moveFolderUpMutation.mutate(folder.id)}
                disabled={
                  folder.parentId
                    ? allFolders.filter(f => f.parentId === folder.parentId)[0]?.id === folder.id
                    : allFolders.filter(f => !f.parentId)[0]?.id === folder.id
                }
                className={
                  moveFolderUpMutation.isPending ||
                  (folder.parentId
                    ? allFolders.filter(f => f.parentId === folder.parentId)[0]?.id === folder.id
                    : allFolders.filter(f => !f.parentId)[0]?.id === folder.id)
                  ? "opacity-50" : ""
                }
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Move Up
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => moveFolderDownMutation.mutate(folder.id)}
                disabled={
                  folder.parentId
                    ? allFolders.filter(f => f.parentId === folder.parentId).pop()?.id === folder.id
                    : allFolders.filter(f => !f.parentId).pop()?.id === folder.id
                }
                className={
                  moveFolderDownMutation.isPending ||
                  (folder.parentId
                    ? allFolders.filter(f => f.parentId === folder.parentId).pop()?.id === folder.id
                    : allFolders.filter(f => !f.parentId).pop()?.id === folder.id)
                  ? "opacity-50" : ""
                }
              >
                <ArrowDown className="mr-2 h-4 w-4" />
                Move Down
              </DropdownMenuItem>
              <MoveFolderDialog
                folder={folder}
                allFolders={allFolders}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Move className="mr-2 h-4 w-4" />
                    Move to Different Folder
                  </DropdownMenuItem>
                }
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-red-500"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Folder
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this folder? This will also delete all documents and subfolders inside it. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteFolderMutation.mutate(folder.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isOpen && (
        <div className="pl-6 space-y-4">
          {folder.documents?.length > 0 && (
            <DocumentsTable 
              documents={folder.documents} 
              folderId={folder.id}
              onReorder={handleDocumentReorder}
              allFolders={allFolders}
            />
          )}
          {folder.subFolders?.length > 0 && (
            <DragDropContext onDragEnd={handleSubFolderDragEnd}>
              <Droppable droppableId={`folder-${folder.id}`}>
                {(provided: DroppableProvided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {sortedSubFolders.map((subFolder, index) => (
                      <Draggable key={subFolder.id} draggableId={subFolder.id} index={index}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "relative",
                              snapshot.isDragging ? "z-10" : ""
                            )}
                          >
                            <FolderTree
                              key={subFolder.id}
                              folder={subFolder}
                              allFolders={allFolders}
                              onFolderReorder={onFolderReorder}
                              onDocumentReorder={onDocumentReorder}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      )}
    </div>
  )
}

export function TrainingDocumentsAdmin() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const { data: folders, isLoading } = useQuery<Folder[]>({
    queryKey: ["training-folders"],
    queryFn: async () => {
      const response = await fetch("/api/folders")
      if (!response.ok) throw new Error("Failed to fetch folders")
      return response.json()
    }
  })

  // Update folder ord mutation
  const updateFolderOrderMutation = useMutation({
    mutationFn: async ({ parentId, items }: { parentId: string, items: Folder[] }) => {
      const response = await fetch("/api/admin/folders/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId,
          folderIds: items.map(f => f.id),
        }),
      });
      if (!response.ok) throw new Error("Failed to reorder folders");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-folders"] });
      toast({
        title: "Success",
        description: "Folders reordered successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reorder folders",
        variant: "destructive",
      });
    }
  });

  // Update document ord mutation
  const updateDocumentOrderMutation = useMutation({
    mutationFn: async ({ folderId, items }: { folderId: string, items: Document[] }) => {
      const response = await fetch("/api/admin/training/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId,
          documentIds: items.map(d => d.id),
        }),
      });
      if (!response.ok) throw new Error("Failed to reorder documents");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-folders"] });
      toast({
        title: "Success",
        description: "Documents reordered successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reorder documents",
        variant: "destructive",
      });
    }
  });

  // Handle folder reordering
  const handleFolderReorder = (parentId: string, items: Folder[]) => {
    updateFolderOrderMutation.mutate({ parentId, items });
  };

  // Handle document reordering
  const handleDocumentReorder = (folderId: string, items: Document[]) => {
    updateDocumentOrderMutation.mutate({ folderId, items });
  };

  // Handle root folder reordering
  const handleRootFolderDragEnd = (result: DropResult) => {
    if (!result.destination || !folders) return;
    
    const items = Array.from(folders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the ord property of each item
    const itemsWithOrder = items.map((item, index) => ({
      ...item,
      ord: index
    }));
    
    updateFolderOrderMutation.mutate({ parentId: "root", items: itemsWithOrder });
  };

  if (isLoading) {
    return <div>Loading...</div>
  }

  // Sort folders by their ord property
  const sortedFolders = [...(folders || [])].sort((a, b) => 
    (a.ord || 0) - (b.ord || 0)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Training Materials</h2>
        <div className="flex gap-2">
          <AddFolderButton />
          <UploadTrainingButton />
        </div>
      </div>

      {folders && folders.length > 0 ? (
        <DragDropContext onDragEnd={handleRootFolderDragEnd}>
          <Droppable droppableId="root-folders">
            {(provided: DroppableProvided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {sortedFolders?.map((folder, index) => (
                  <Draggable key={folder.id} draggableId={folder.id} index={index}>
                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn(
                          "relative",
                          snapshot.isDragging ? "z-10" : ""
                        )}
                      >
                        <FolderTree
                          key={folder.id}
                          folder={folder}
                          allFolders={getAllFoldersFlattened(folders)}
                          onFolderReorder={handleFolderReorder}
                          onDocumentReorder={handleDocumentReorder}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="flex items-center justify-center p-8 border rounded-md border-dashed">
          <div className="text-center">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No folders found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new folder
            </p>
          </div>
        </div>
      )}
    </div>
  )
}