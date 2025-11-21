
import { useState, useEffect } from "react";
import { GetServerSideProps } from 'next';
import { Layout } from "@/components/layout/Layout";
import { useLoading } from "@/hooks/use-loading";
import { requireAuthGetServerSideProps } from "@/lib/server-auth";
import { usePagination } from "@/hooks/use-pagination";
import { apiGet, apiDelete } from "@/lib/api-client";
import { Method } from "@/types";
import { PAGINATION } from "@/config/constants";
import { 
  Plus, 
  Search, 
  ClipboardList,
  MoreVertical, 
  Edit,
  Trash,
  ChevronLeft,
  ChevronRight,
  Eye
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
import MethodDialog from "@/components/dialogs/MethodDialog";
import { useToast } from "@/hooks/use-toast";

const Methods = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<Method | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  
  // Paginação
  const itemsPerPage = PAGINATION.METHODS_PER_PAGE;
  
  async function loadMethods() {
    setLoading(true);
    startLoading();
    try {
      const data = await apiGet<Method[]>('/api/db/methods');
      setMethods(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível carregar os métodos.' });
    } finally {
      setLoading(false);
      stopLoading();
    }
  }

  useEffect(() => {
    loadMethods();
  }, []);
  
  const filteredMethods = methods.filter(
    (method) =>
      method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Use pagination hook to manage pagination state and logic
  const {
    currentPage,
    totalPages,
    currentPageItems,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage,
  } = usePagination({
    items: filteredMethods,
    itemsPerPage,
    searchDependency: searchTerm,
  });

  // Map difficulty to color
  

  const handleOpenEditDialog = (method: Method) => {
    setEditingMethod(method);
    setSelectedMethod(null);
    setMethodDialogOpen(true);
  };

  const handleViewMethod = (method: Method) => {
    setSelectedMethod(method);
    setEditingMethod(null);
    setMethodDialogOpen(true);
  };

  const handleAddNewMethod = () => {
    setEditingMethod(null);
    setSelectedMethod(null);
    setMethodDialogOpen(true);
  };

  const handleDeleteMethod = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este método?')) return;
    try {
      await apiDelete(`/api/db/methods/${id}`);
      loadMethods();
      toast({ title: 'Método deletado', description: 'O método foi removido com sucesso.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível deletar o método.' });
    }
  };
  return (
    <Layout>
      <div className="w-full py-6 sm:py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Métodos de Treino</h1>
            <p className="text-muted-foreground">Gerencie técnicas e métodos de treinamento. ({filteredMethods.length} de {methods.length})</p>
          </div>
          
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={handleAddNewMethod}
          >
            <Plus className="h-4 w-4" />
            Novo Método
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar métodos por nome ou descrição..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="border border-border/40">
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
            {currentPageItems.map((method) => (
              <Card 
                key={method.id}
                onClick={() => handleViewMethod(method)}
                className="transition-all duration-300 hover:shadow-md border border-border/40 cursor-pointer"
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg mt-1 flex-shrink-0">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-medium">{method.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{method.description}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        onClick={(e) => e.stopPropagation()}
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMethod(method);
                        }}
                      >
                        <Eye className="h-4 w-4" /> Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDialog(method);
                        }}
                      >
                        <Edit className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMethod(method.id);
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
        
        {filteredMethods.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhum método encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar seus filtros ou adicione um novo método.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredMethods.length > 0 && !loading && (
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

        <MethodDialog 
          open={methodDialogOpen}
          onOpenChange={(open) => {
            setMethodDialogOpen(open);
            if (!open) {
              setEditingMethod(null);
              setSelectedMethod(null);
            }
          }}
          isEditing={!!editingMethod}
          initialData={editingMethod || selectedMethod}
          onSaved={(method) => {
            loadMethods();
            toast({
              title: "Método salvo",
              description: method?.name || "Registro criado.",
            });
            setEditingMethod(null);
            setSelectedMethod(null);
          }}
        />
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = requireAuthGetServerSideProps;

export default Methods;
