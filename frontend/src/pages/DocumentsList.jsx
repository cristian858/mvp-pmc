import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import DocumentCard from '../components/DocumentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../hooks/useToast';
import { documentService } from '../services/api';
import {
  SearchIcon,
  DocumentIcon,
  FilterIcon,
  SortIcon,
  UploadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../components/Icons';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados', color: 'slate' },
  { value: 'pendiente', label: 'Pendiente', color: 'amber' },
  { value: 'firmado', label: 'Firmado', color: 'emerald' },
  { value: 'rechazado', label: 'Rechazado', color: 'red' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
  { value: 'name_asc', label: 'Nombre A-Z' },
  { value: 'name_desc', label: 'Nombre Z-A' },
];

export function DocumentsList() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9;

  useEffect(() => {
    loadDocuments();
  }, [currentPage]);

  // Recargar cuando la página gana foco (vuelve de otra página)
  useEffect(() => {
    const handleFocus = () => {
      loadDocuments();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Recargar cuando vuelve de la página de detalle
  useEffect(() => {
    const handlePopState = () => {
      loadDocuments();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.list(currentPage, itemsPerPage);
      
      const pagination = response.data?.pagination || response.pagination;
      setTotalItems(pagination?.total || 0);
      
      const docs = response.data?.data || response.data || [];
      setDocuments(docs);
    } catch (error) {
      console.error('Error cargando documentos:', error);
      addToast('Error al cargar documentos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedDocs = React.useMemo(() => {
    let filtered = [...documents];

    // Filtro por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter((doc) => doc.status === filterStatus);
    }

    // Búsqueda por nombre
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((doc) =>
        (doc.filename || '').toLowerCase().includes(term)
      );
    }

    // Ordenamiento
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        break;
      case 'name_asc':
        filtered.sort((a, b) => (a.filename || '').localeCompare(b.filename || ''));
        break;
      case 'name_desc':
        filtered.sort((a, b) => (b.filename || '').localeCompare(a.filename || ''));
        break;
    }

    return filtered;
  }, [documents, filterStatus, searchTerm, sortBy]);

  useEffect(() => {
    if (!loading) {
      gsap.from('.doc-card-animate', {
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power3.out',
      });
    }
  }, [loading, currentPage]);

  const handleViewDocument = (docId) => {
    navigate(`/documents/${docId}`);
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      try {
        await documentService.delete(docId);
        setDocuments(documents.filter((doc) => doc.id !== docId));
        addToast('Documento eliminado correctamente', 'success');
      } catch (error) {
        console.error('Error eliminando documento:', error);
        addToast('Error al eliminar documento', 'error');
      }
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getStatusCount = (status) => {
    if (status === 'all') return totalItems;
    return documents.filter(d => d.status === status).length;
  };

  if (loading && documents.length === 0) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" message="Cargando documentos..." />
      </div>
    );
  }

  return (
    <div className="py-8 px-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mis Documentos</h1>
          <p className="text-slate-600 mt-1">Gestiona y revisa todos tus documentos</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="btn-primary flex items-center gap-2 rounded-lg"
        >
          <UploadIcon className="w-5 h-5" />
          Subir documento
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre de archivo..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 pr-8 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortIcon className="w-5 h-5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 pr-8 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Quick Filters */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-500">Filtrar por:</span>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  setFilterStatus(opt.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === opt.value
                    ? opt.value === 'all' ? 'bg-slate-800 text-white' :
                      opt.value === 'pendiente' ? 'bg-amber-500 text-white' :
                      opt.value === 'firmado' ? 'bg-emerald-500 text-white' :
                      'bg-red-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
                <span className="ml-1.5 opacity-70">({getStatusCount(opt.value)})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">
          Mostrando <span className="font-semibold text-slate-900">{filteredAndSortedDocs.length}</span> documentos
          {totalItems > itemsPerPage && (
            <span className="text-slate-500"> (total: {totalItems})</span>
          )}
        </span>
      </div>

      {/* Documents Grid */}
      {filteredAndSortedDocs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedDocs.map((doc) => (
              <div key={doc.id} className="doc-card-animate">
                <DocumentCard
                  document={doc}
                  onView={handleViewDocument}
                  onDelete={handleDeleteDocument}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Siguiente
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <DocumentIcon className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-slate-600 text-lg font-medium mb-2">No hay documentos</p>
          <p className="text-slate-500 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'No hay documentos que coincidan con tu búsqueda'
              : 'Comienza subiendo tu primer documento'}
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary px-6 py-2.5 rounded-lg inline-flex items-center gap-2"
          >
            <UploadIcon className="w-5 h-5" />
            Subir documento
          </button>
        </div>
      )}
    </div>
  );
}