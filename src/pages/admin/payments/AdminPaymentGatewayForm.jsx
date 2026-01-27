import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {paymentGatewaysService} from '../../../services/api';
import {toast} from 'react-hot-toast';
import {ChevronLeft, Save, CreditCard, Webhook, Settings, DollarSign, Plus, Trash2} from 'lucide-react';

const PaymentGatewayForm = ({initialData = null, isEdit = false}) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        is_active: true,
        display_order: 0,
        credentials: {},
        settings: {},
        supports_webhooks: false,
        webhook_secret: '',
        supported_currencies: ['USD'],
    });

    const [credentialFields, setCredentialFields] = useState([]);
    const [settingFields, setSettingFields] = useState([]);
    const [newCurrency, setNewCurrency] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                slug: initialData.slug || '',
                is_active: initialData.is_active ?? true,
                display_order: initialData.display_order || 0,
                credentials: initialData.credentials || {},
                settings: initialData.settings || {},
                supports_webhooks: initialData.supports_webhooks ?? false,
                webhook_secret: initialData.webhook_secret || '',
                supported_currencies: initialData.supported_currencies || ['USD'],
            });

            // Initialize dynamic fields from data
            if (initialData.credentials) {
                setCredentialFields(Object.entries(initialData.credentials).map(([key, value]) => ({key, value})));
            }
            if (initialData.settings) {
                setSettingFields(Object.entries(initialData.settings).map(([key, value]) => ({key, value})));
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddField = (type) => {
        if (type === 'credential') {
            setCredentialFields([...credentialFields, {key: '', value: ''}]);
        } else {
            setSettingFields([...settingFields, {key: '', value: ''}]);
        }
    };

    const handleRemoveField = (type, index) => {
        if (type === 'credential') {
            setCredentialFields(credentialFields.filter((_, i) => i !== index));
        } else {
            setSettingFields(settingFields.filter((_, i) => i !== index));
        }
    };

    const handleFieldChange = (type, index, part, value) => {
        if (type === 'credential') {
            const newFields = [...credentialFields];
            newFields[index][part] = value;
            setCredentialFields(newFields);
        } else {
            const newFields = [...settingFields];
            newFields[index][part] = value;
            setSettingFields(newFields);
        }
    };

    const handleAddCurrency = () => {
        if (newCurrency && !formData.supported_currencies.includes(newCurrency.toUpperCase())) {
            setFormData(prev => ({
                ...prev,
                supported_currencies: [...prev.supported_currencies, newCurrency.toUpperCase()]
            }));
            setNewCurrency('');
        }
    };

    const handleRemoveCurrency = (currency) => {
        setFormData(prev => ({
            ...prev,
            supported_currencies: prev.supported_currencies.filter(c => c !== currency)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Convert fields back to objects
        const credentials = {};
        credentialFields.forEach(f => {
            if (f.key) credentials[f.key] = f.value;
        });

        const settings = {};
        settingFields.forEach(f => {
            if (f.key) settings[f.key] = f.value;
        });

        const submitData = {
            ...formData,
            credentials,
            settings,
        };

        try {
            if (isEdit) {
                await paymentGatewaysService.adminUpdate(initialData.id, submitData);
                toast.success('Payment gateway updated successfully');
            } else {
                await paymentGatewaysService.adminCreate(submitData);
                toast.success('Payment gateway created successfully');
            }
            navigate('/admin/payments/gateways');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save payment gateway');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl">
            <button
                onClick={() => navigate('/admin/payments/gateways')}
                className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 mr-1"/>
                Back to List
            </button>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-primary-600"/>
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gateway Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. PayPal, Stripe, Paynow"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                            <input
                                type="text"
                                name="slug"
                                required
                                disabled={isEdit}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="e.g. paypal, stripe, paynow"
                                value={formData.slug}
                                onChange={handleChange}
                            />
                            {!isEdit && <p className="mt-1 text-xs text-gray-500">Unique identifier used in code</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                            <input
                                type="number"
                                name="display_order"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.display_order}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-center h-full pt-8">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    className="sr-only peer"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <div
                                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                <span
                                    className="ml-3 text-sm font-medium text-gray-900">Active and available for users</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Credentials Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Settings className="w-6 h-6 text-amber-600"/>
                            API Credentials
                        </h2>
                        <button
                            type="button"
                            onClick={() => handleAddField('credential')}
                            className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4"/>
                            Add Credential
                        </button>
                    </div>

                    <div className="space-y-4">
                        {credentialFields.length > 0 ? credentialFields.map((field, index) => (
                            <div key={index} className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Key (e.g. api_key)"
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200"
                                    value={field.key}
                                    onChange={(e) => handleFieldChange('credential', index, 'key', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Value"
                                    className="flex-[2] px-4 py-2 rounded-lg border border-gray-200"
                                    value={field.value}
                                    onChange={(e) => handleFieldChange('credential', index, 'value', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveField('credential', index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 className="w-5 h-5"/>
                                </button>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm italic">No credentials defined. API keys, secrets etc.
                                go here.</p>
                        )}
                    </div>
                </div>

                {/* Webhooks Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Webhook className="w-6 h-6 text-purple-600"/>
                        Webhook Settings
                    </h2>

                    <div className="space-y-6">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="supports_webhooks"
                                className="sr-only peer"
                                checked={formData.supports_webhooks}
                                onChange={handleChange}
                            />
                            <div
                                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900">Supports Webhooks</span>
                        </label>

                        {formData.supports_webhooks && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Secret</label>
                                <input
                                    type="text"
                                    name="webhook_secret"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Secret used to verify webhook signatures"
                                    value={formData.webhook_secret}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Currencies Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-600"/>
                        Supported Currencies
                    </h2>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {formData.supported_currencies.map(currency => (
                            <span key={currency}
                                  className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                {currency}
                                <button type="button" onClick={() => handleRemoveCurrency(currency)}
                                        className="hover:text-red-600">
                  <Trash2 className="w-3 h-3"/>
                </button>
              </span>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="px-4 py-2 rounded-lg border border-gray-200 uppercase"
                            placeholder="USD"
                            value={newCurrency}
                            onChange={(e) => setNewCurrency(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCurrency())}
                        />
                        <button
                            type="button"
                            onClick={handleAddCurrency}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold transition-colors"
                        >
                            Add Currency
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/payments/gateways')}
                        className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                        ) : (
                            <Save className="w-5 h-5"/>
                        )}
                        {isEdit ? 'Update Gateway' : 'Create Gateway'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentGatewayForm;
