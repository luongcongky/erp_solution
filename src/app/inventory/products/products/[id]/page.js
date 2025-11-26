export default function ProductDetailPage({ params }) {
    // In a real app, fetch product by params.id
    return (
        <div className="container" style={{ padding: '4rem 20px', display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px', height: '500px', background: '#222', borderRadius: '16px' }}>
                {/* Product Image Placeholder */}
            </div>

            <div style={{ flex: '1 1 400px' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Product Name {params.id}</h1>
                <p style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '2rem' }}>$299.00</p>

                <p style={{ lineHeight: '1.6', color: '#ccc', marginBottom: '2rem' }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>

                <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.2rem' }}>
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
