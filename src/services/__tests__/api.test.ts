import { getProducts, getProductBySlug, getCategories, getCategoryBySlug, getRelatedProducts } from '../api';
import { httpClient } from '@/lib/httpClient';

jest.mock('@/lib/httpClient', () => {
  return {
    __esModule: true,
    httpClient: {
      get: jest.fn(),
    },
  };
});

describe('services/api', () => {
  beforeEach(() => {
    (httpClient.get as jest.Mock).mockReset();
  });

  it('builds correct query for getProducts', async () => {
    (httpClient.get as jest.Mock).mockResolvedValueOnce({ data: { docs: [], totalDocs: 0, totalPages: 0, page: 1 } });
    await getProducts({ page: 2, limit: 20, category: 'fleurs-cbd', featured: true, sort: '-price', minPrice: 10, maxPrice: 50 });
    const url = (httpClient.get as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/products?');
    expect(url).toContain('page=2');
    expect(url).toContain('limit=20');
    expect(url).toContain('where%5Bcategory%5D%5Bcontains%5D=fleurs-cbd');
    expect(url).toContain('where%5BisFeatured%5D%5Bequals%5D=true');
    expect(url).toContain('where%5BisActive%5D%5Bequals%5D=true');
    expect(url).toContain('sort=-price');
    expect(url).toContain('where%5Bprice%5D%5Bgreater_than_equal%5D=10');
    expect(url).toContain('where%5Bprice%5D%5Bless_than_equal%5D=50');
  });

  it('falls back for getProductBySlug when API fails', async () => {
    (httpClient.get as jest.Mock).mockRejectedValueOnce(new Error('network'));
    const p = await getProductBySlug('banana-berry');
    expect(p.slug).toBe('banana-berry');
  });

  it('falls back for getCategories when API fails', async () => {
    (httpClient.get as jest.Mock).mockRejectedValueOnce(new Error('network'));
    const cats = await getCategories();
    expect(cats.length).toBeGreaterThan(0);
  });

  it('getCategoryBySlug: uses API path', async () => {
    (httpClient.get as jest.Mock).mockResolvedValueOnce({ data: { docs: [{ id: '1', name: 'Fleurs CBD', slug: 'fleurs-cbd' }] } });
    const cat = await getCategoryBySlug('fleurs-cbd');
    expect(cat.slug).toBe('fleurs-cbd');
    const url = (httpClient.get as jest.Mock).mock.calls[0][0];
    expect(url).toContain('/categories?where[slug][equals]=fleurs-cbd');
  });

  it('getRelatedProducts: builds multi-category query', async () => {
    (httpClient.get as jest.Mock).mockResolvedValueOnce({ data: { docs: [] } });
    await getRelatedProducts('p1', ['c1', 'c2'], 3);
    const url = (httpClient.get as jest.Mock).mock.calls[0][0];
    expect(url).toContain('limit=3');
    expect(url).toContain('where%5Bid%5D%5Bnot_equals%5D=p1');
    expect(url).toContain('where%5Bcategory%5D%5Bcontains%5D=c1');
    expect(url).toContain('where%5Bcategory%5D%5Bcontains%5D=c2');
  });
});
