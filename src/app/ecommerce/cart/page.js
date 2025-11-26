import Link from 'next/link';

export default function CartPage() {
    return (
        <div className="container" style={{ padding: '4rem 20px' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Your Cart</h1>

            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                <p>Your cart is currently empty.</p>
                <br />
                <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
            </div>
        </div>
    );
}
