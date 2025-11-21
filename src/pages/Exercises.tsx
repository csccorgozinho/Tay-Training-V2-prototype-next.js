
import { useState, useEffect } from "react";
import { GetServerSideProps } from 'next';
import { Layout } from "@/components/layout/Layout";
import { useLoading } from "@/hooks/use-loading";
import { requireAuthGetServerSideProps } from "@/lib/server-auth";
import { usePagination } from "@/hooks/use-pagination";
import { apiGet, apiDelete } from "@/lib/api-client";
import { Exercise } from "@/types";
import { PAGINATION } from "@/config/constants";
import { 
  ChevronLeft,
  ChevronRight, 
  Plus, 
  Search, 
  Dumbbell,
  MoreVertical, 
  Edit,
  Eye,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import ExerciseDialog from "@/components/dialogs/ExerciseDialog";
import { useToast } from "@/hooks/use-toast";

const Exercises = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  // CLEANUP: Restored selectedExercise state for view mode (displays data without editing)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  // CLEANUP: Typed exercises array with Exercise interface
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const itemsPerPage = PAGINATION.EXERCISES_PER_PAGE;

  async function loadExercises(): Promise<void> {
    setLoading(true);
    startLoading();
    try {
      const data = await apiGet<Exercise[]>('/api/db/exercises');
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível carregar os exercícios.' });
    } finally {
      setLoading(false);
      stopLoading();
    }
  }

  useEffect(() => {
    loadExercises();
  }, []);

  // CLEANUP: Simplified filtering - only search by name and description
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // CLEANUP: Use pagination hook to manage pagination state and logic
  const {
    currentPage,
    totalPages,
    currentPageItems,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage,
  } = usePagination({
    items: filteredExercises,
    itemsPerPage,
    searchDependency: searchTerm,
  });

  // CLEANUP: Renamed and simplified - removed unused setSelectedExercise calls
  const handleOpenEditDialog = (exercise: Exercise): void => {
    setEditingExercise(exercise);
    setSelectedExercise(null);
    setExerciseDialogOpen(true);
  };

  // CLEANUP: Added view handler to display exercise without editing (similar to Methods.tsx)
  const handleViewExercise = (exercise: Exercise): void => {
    setSelectedExercise(exercise);
    setEditingExercise(null);
    setExerciseDialogOpen(true);
  };

  const handleAddNewExercise = (): void => {
    setEditingExercise(null);
    setSelectedExercise(null);
    setExerciseDialogOpen(true);
  };

  // CLEANUP: Implemented proper delete handler with API call (similar to Methods.tsx pattern)
  const handleDeleteExercise = async (id: number): Promise<void> => {
    if (!confirm('Tem certeza que deseja deletar este exercício?')) return;
    try {
      await apiDelete(`/api/db/exercises/${id}`);
      loadExercises();
      toast({ title: 'Exercício deletado', description: 'O exercício foi removido com sucesso.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível deletar o exercício.' });
    }
  };

  return (
    <Layout>
      <div className="w-full py-6 sm:py-8 px-4 sm:px-6 lg:px-8 animate-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exercícios</h1>
            <p className="text-muted-foreground">
              Gerencie seu catálogo de exercícios ({filteredExercises.length} de {exercises.length})
            </p>
          </div>
          
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={handleAddNewExercise}
          >
            <Plus className="h-4 w-4" />
            Novo Exercício
          </Button>
        </div>
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar exercícios por nome ou descrição..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="border border-border/40">
                <CardHeader>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentPageItems.map((exercise) => (
              <Card 
                key={`exercise-${exercise.id}`}
                onClick={() => handleViewExercise(exercise)}
                className="transition-all duration-300 hover:shadow-md border border-border/40 cursor-pointer"
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg mt-1 flex-shrink-0">
                      <Dumbbell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-medium">{exercise.name || 'Sem nome'}</CardTitle>
                      <CardDescription className="line-clamp-2">{exercise.description || '-'}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button onClick={(e) => e.stopPropagation()} variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewExercise(exercise);
                        }}
                      >
                        <Eye className="h-4 w-4" /> Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDialog(exercise);
                        }}
                      >
                        <Edit className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExercise(exercise.id);
                        }}
                      >
                        <Trash className="h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
        
        {filteredExercises.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <Dumbbell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhum exercício encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar seus filtros ou adicione um novo exercício.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredExercises.length > 0 && !loading && (
          <div className="flex justify-center mt-8 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                // Lógica para mostrar páginas ao redor da atual
                let pageToShow;
                if (totalPages <= 5) {
                  pageToShow = index + 1;
                } else if (currentPage <= 3) {
                  pageToShow = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageToShow = totalPages - 4 + index;
                } else {
                  pageToShow = currentPage - 2 + index;
                }
                
                return (
                  <Button
                    key={pageToShow}
                    variant={currentPage === pageToShow ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10"
                    onClick={() => setCurrentPage(pageToShow)}
                  >
                    {pageToShow}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <ExerciseDialog 
          open={exerciseDialogOpen}
          onOpenChange={(open) => {
            setExerciseDialogOpen(open);
            // CLEANUP: Cleanup both states when closing dialog
            if (!open) { 
              setEditingExercise(null);
              setSelectedExercise(null);
            }
          }}
          isEditing={!!editingExercise}
          initialData={editingExercise || selectedExercise}
          onSaved={(ex) => {
            // Refresh list after creation or deletion
            loadExercises();
            toast({ title: 'Exercício salvo', description: ex?.name || 'Registro criado.' });
            setEditingExercise(null);
            setSelectedExercise(null);
          }}
        />
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = requireAuthGetServerSideProps;

export default Exercises;