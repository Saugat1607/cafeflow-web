// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './features/auth/context/AuthContext';
// import ProtectedRoute from './shared/components/ProtectedRoute';

// import Login from './features/auth/pages/Login';
// import Dashboard from './features/dashboard/pages/Dashboard';
// import Menu from './features/menu/pages/Menu';
// import Tables from './features/tables/pages/Tables';
// import Orders from './features/orders/pages/Orders';

// export default function App() {
//     return (
//         <BrowserRouter>
//             <AuthProvider>
//                 <Routes>
//                     <Route path="/login" element={<Login />} />

//                     <Route
//                         path="/dashboard"
//                         element={
//                             <ProtectedRoute>
//                                 <Dashboard />
//                             </ProtectedRoute>
//                         }
//                     />
//                     <Route
//                         path="/menu"
//                         element={
//                             <ProtectedRoute>
//                                 <Menu />
//                             </ProtectedRoute>
//                         }
//                     />
//                     <Route
//                         path="/tables"
//                         element={
//                             <ProtectedRoute>
//                                 <Tables />
//                             </ProtectedRoute>
//                         }
//                     />
//                     <Route
//                         path="/orders"
//                         element={
//                             <ProtectedRoute>
//                                 <Orders />
//                             </ProtectedRoute>
//                         }
//                     />

//                     <Route path="/" element={<Navigate to="/dashboard" replace />} />
//                 </Routes>
//             </AuthProvider>
//         </BrowserRouter>
//     );
// }

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import Layout from './shared/components/Layout';

import Login from './features/auth/pages/Login';
import Dashboard from './features/dashboard/pages/Dashboard';
import Menu from './features/menu/pages/Menu';
import Tables from './features/tables/pages/Tables';
import Orders from './features/orders/pages/Orders';
import Billing from './features/billing/pages/Billing';
import Expenses from "./features/expenses/pages/Expenses";
import Inventory from "./features/inventory/pages/Inventory";
import Invoices from "./features/invoices/pages/Invoices";
import Staff from "./features/staff/pages/Staff";
import Reports from "./features/reports/pages/Reports";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/menu"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Menu />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tables"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Tables />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Orders />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/billing"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Billing />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/expenses"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Expenses />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/inventory"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Inventory />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="/invoices"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Invoices />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    <Route 
                        path="/admin/staff"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Staff />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Reports />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}