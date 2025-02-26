"use client"

import { useState, useRef } from "react"
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
  FolderInput
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
  order?: number
  folderId: string
}

interface Folder {
  id: string
  name: string
  description?: string
  documents: Document[]
  subFolders: Folder[]
  parentId: string | null
  order?: number
}

type SortField = "title" | "skillLevel" | "fileSize" | "updatedAt"
type SortDirection = "asc" | "desc"

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

  if (!documents || documents.length === 0) {
    return null;
  }

  // Sort documents based on current sort criteria
  const sortedDocuments = [...documents].sort((a, b) => {
    const directionModifier = sortDirection === "asc" ? 1 : -1;
    
    if (sortField === "title") {
      return a.title.localeCompare(b.title) * directionModifier;
    } 
    else if (sortField === "skillLevel") {
      return (a.skillLevel - b.skillLevel) * directionModifier;
    }
    else if (sortField === "fileSize") {
      return (a.fileSize - b.fileSize) * directionModifier;
    }
    else {
      // updatedAt
      return (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) * directionModifier;
    }
  });

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
    
    // Update the order property of each item
    const itemsWithOrder = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    onReorder(itemsWithOrder);
  };

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const response = await fetch(`/api/admin/documents/${docId}`, {
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

  const handleDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete document")

      toast({
        title: "Success",
        description: "Document deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead> {/* Handle column */}
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("title")} className="p-0 h-8">
                    Title
                    <ArrowUpDown className={cn(
                      "ml-1 h-4 w-4",
                      sortField === "title" ? "text-primary" : "text-muted-foreground"
                    )} />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("skillLevel")} className="p-0 h-8">
                    Skill Level
                    <ArrowUpDown className={cn(
                      "ml-1 h-4 w-4",
                      sortField === "skillLevel" ? "text-primary" : "text-muted-foreground"
                    )} />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("fileSize")} className="p-0 h-8">
                    Vorraussetzungen
                    <ArrowUpDown className={cn(
                      "ml-1 h-4 w-4",
                      sortField === "fileSize" ? "text-primary" : "text-muted-foreground"
                    )} />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("updatedAt")} className="p-0 h-8">
                    Last Updated
                    <ArrowUpDown className={cn(
                      "ml-1 h-4 w-4",
                      sortField === "updatedAt" ? "text-primary" : "text-muted-foreground"
                    )} />
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
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
                          <TableCell>
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                                      onClick={() => handleDelete(doc.id)}
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
  const hasContents = (folder.documents?.length ?? 0) > 0 || (folder.subFolders?.length ?? 0) > 0
  
  // Sort subfolders by their order property
  const sortedSubFolders = [...(folder.subFolders || [])].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );

  // Handle drag end for subfolders
  const handleSubFolderDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(sortedSubFolders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the order property of each item
    const itemsWithOrder = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    onFolderReorder(folder.id, itemsWithOrder);
  };

  // Handle document reordering
  const handleDocumentReorder = (reorderedDocs: Document[]) => {
    onDocumentReorder(folder.id, reorderedDocs);
  };

  return (
    <div className="space-y-2 border border-border rounded-md p-2 bg-card">
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="justify-start hover:bg-accent w-full"
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Move className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <MoveFolderDialog
              folder={folder}
              allFolders={allFolders}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Move to Different Folder
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
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

  // Update folder order mutation
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

  // Update document order mutation
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
    
    // Update the order property of each item
    const itemsWithOrder = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    updateFolderOrderMutation.mutate({ parentId: "root", items: itemsWithOrder });
  };

  if (isLoading) {
    return <div>Loading...</div>
  }

  // Sort folders by their order property
  const sortedFolders = [...(folders || [])].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
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