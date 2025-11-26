'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import './swagger-ui.css';

export default function ApiDocsPage() {
    const [spec, setSpec] = useState(null);
    const [loading, setLoading] = useState(true);

    // Suppress React warnings from swagger-ui-react library
    useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            if (
                typeof args[0] === 'string' &&
                args[0].includes('UNSAFE_componentWillReceiveProps')
            ) {
                return;
            }
            originalError.apply(console, args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    useEffect(() => {
        // Fetch the OpenAPI spec
        fetch('/api/swagger')
            .then(res => res.json())
            .then(data => {
                setSpec(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading API spec:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--background)',
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!spec) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--background)',
                color: 'var(--text-primary)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1>Error Loading API Documentation</h1>
                    <p>Unable to load OpenAPI specification</p>
                </div>
            </div>
        );
    }

    return (
        <div className="swagger-container">
            <div className="swagger-header">
                <h1>API Documentation</h1>
                <p>Comprehensive API documentation for the ERP System</p>
            </div>
            <SwaggerUI
                spec={spec}
                docExpansion="none"
                defaultModelsExpandDepth={-1}
                filter={true}
                onComplete={() => {
                    console.log('[SwaggerUI] onComplete called');

                    // Count operations per tag from spec
                    const operationsByTag = {};
                    if (spec.paths) {
                        Object.keys(spec.paths).forEach(path => {
                            Object.keys(spec.paths[path]).forEach(method => {
                                if (method === 'parameters') return;
                                const operation = spec.paths[path][method];
                                if (operation.tags && operation.tags.length > 0) {
                                    const tag = operation.tags[0];
                                    operationsByTag[tag] = (operationsByTag[tag] || 0) + 1;
                                }
                            });
                        });
                    }

                    console.log('[Badge Injection] Operations by tag:', operationsByTag);

                    // Wait for DOM
                    setTimeout(() => {
                        const tagSections = document.querySelectorAll('.opblock-tag-section');
                        console.log(`[Badge Injection] Found ${tagSections.length} sections`);

                        let badgesAdded = 0;

                        tagSections.forEach((section, index) => {
                            const tagHeader = section.querySelector('.opblock-tag');
                            if (!tagHeader) return;

                            if (tagHeader.querySelector('.operation-count-badge')) return;

                            // Get tag name
                            const tagName = tagHeader.getAttribute('data-tag') ||
                                tagHeader.querySelector('a')?.textContent?.trim() ||
                                tagHeader.textContent?.trim().split('\n')[0]?.trim();

                            console.log(`[Badge Injection] Section ${index}: Tag="${tagName}"`);

                            const count = operationsByTag[tagName] || 0;
                            console.log(`[Badge Injection] Section ${index}: Count=${count}`);

                            if (count === 0) return;

                            // Create badge
                            const badge = document.createElement('span');
                            badge.className = 'operation-count-badge';
                            badge.textContent = `${count}`;
                            badge.style.cssText = `
                                background: #3B82F6 !important;
                                color: white !important;
                                padding: 4px 12px !important;
                                border-radius: 6px !important;
                                font-size: 0.875rem !important;
                                font-weight: 600 !important;
                                margin-left: 12px !important;
                                display: inline-block !important;
                                width: fit-content !important;
                                flex-grow: 0 !important;
                                flex-shrink: 0 !important;
                                line-height: normal !important;
                            `;

                            // Insert badge
                            // Insert badge
                            // Try to find the specific span containing the text to insert after it
                            const labelSpan = Array.from(tagHeader.querySelectorAll('span'))
                                .find(el => el.textContent.trim() === tagName);

                            if (labelSpan) {
                                labelSpan.parentNode.insertBefore(badge, labelSpan.nextSibling);
                                badgesAdded++;
                                console.log(`[Badge Injection] Section ${index}: ✅ Added after label span`);
                            } else {
                                // Fallback
                                const tagLink = tagHeader.querySelector('a');
                                if (tagLink) {
                                    tagLink.appendChild(badge);
                                    badgesAdded++;
                                    console.log(`[Badge Injection] Section ${index}: ✅ Added to link (fallback)`);
                                } else {
                                    tagHeader.appendChild(badge);
                                    badgesAdded++;
                                    console.log(`[Badge Injection] Section ${index}: ✅ Added to header (fallback)`);
                                }
                            }
                        });

                        console.log(`[Badge Injection] ✅✅✅ Total: ${badgesAdded}`);
                    }, 500);
                }}
            />
        </div>
    );
}
