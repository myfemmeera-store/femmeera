<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Roles
        $roles = [
            ['name' => 'SUPER_ADMIN', 'display_name' => 'Super Administrator', 'description' => 'Full unrestricted system access'],
            ['name' => 'ADMIN', 'display_name' => 'Administrator', 'description' => 'General store administration'],
            ['name' => 'PRODUCT_MANAGER', 'display_name' => 'Product Manager', 'description' => 'Catalog, category, and collection management'],
            ['name' => 'INVENTORY_MANAGER', 'display_name' => 'Inventory Manager', 'description' => 'Stock balance adjustments and warehouse tracking'],
            ['name' => 'ORDER_MANAGER', 'display_name' => 'Order Manager', 'description' => 'Order fulfillment and shipping updates'],
            ['name' => 'MARKETING_MANAGER', 'display_name' => 'Marketing Manager', 'description' => 'Coupons, offers, hero banners, and popups'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(['name' => $role['name']], array_merge($role, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 2. Seed Granular Permissions
        $permissions = [
            // Catalog
            ['name' => 'products.view', 'module' => 'catalog', 'description' => 'View products'],
            ['name' => 'products.create', 'module' => 'catalog', 'description' => 'Create products and variants'],
            ['name' => 'products.update', 'module' => 'catalog', 'description' => 'Update products and variants'],
            ['name' => 'products.delete', 'module' => 'catalog', 'description' => 'Delete products'],
            
            ['name' => 'categories.view', 'module' => 'catalog', 'description' => 'View categories'],
            ['name' => 'categories.create', 'module' => 'catalog', 'description' => 'Create categories'],
            ['name' => 'categories.update', 'module' => 'catalog', 'description' => 'Update categories'],
            ['name' => 'categories.delete', 'module' => 'catalog', 'description' => 'Delete categories'],

            // Inventory
            ['name' => 'inventory.view', 'module' => 'inventory', 'description' => 'View inventory stock balances'],
            ['name' => 'inventory.update', 'module' => 'inventory', 'description' => 'Adjust stock and record inventory transactions'],

            // Orders
            ['name' => 'orders.view', 'module' => 'orders', 'description' => 'View order history'],
            ['name' => 'orders.update', 'module' => 'orders', 'description' => 'Update order processing status'],
            ['name' => 'orders.cancel', 'module' => 'orders', 'description' => 'Cancel orders'],
            ['name' => 'orders.refund', 'module' => 'orders', 'description' => 'Issue order refunds'],

            // Customers
            ['name' => 'customers.view', 'module' => 'customers', 'description' => 'View customer profiles'],
            ['name' => 'customers.update', 'module' => 'customers', 'description' => 'Update customer status'],

            // Reviews
            ['name' => 'reviews.view', 'module' => 'reviews', 'description' => 'View product reviews'],
            ['name' => 'reviews.moderate', 'module' => 'reviews', 'description' => 'Approve or reject customer reviews'],

            // Coupons & Offers
            ['name' => 'coupons.view', 'module' => 'marketing', 'description' => 'View promo coupons'],
            ['name' => 'coupons.create', 'module' => 'marketing', 'description' => 'Create coupons'],
            ['name' => 'coupons.update', 'module' => 'marketing', 'description' => 'Update coupons'],
            ['name' => 'coupons.delete', 'module' => 'marketing', 'description' => 'Disable or delete coupons'],

            ['name' => 'offers.view', 'module' => 'marketing', 'description' => 'View promotional offers'],
            ['name' => 'offers.create', 'module' => 'marketing', 'description' => 'Create offers'],
            ['name' => 'offers.update', 'module' => 'marketing', 'description' => 'Update offers'],
            ['name' => 'offers.delete', 'module' => 'marketing', 'description' => 'Delete offers'],

            // CMS
            ['name' => 'homepage.view', 'module' => 'cms', 'description' => 'View homepage section layouts'],
            ['name' => 'homepage.update', 'module' => 'cms', 'description' => 'Update homepage sections'],
            ['name' => 'banners.view', 'module' => 'cms', 'description' => 'View hero banners'],
            ['name' => 'banners.create', 'module' => 'cms', 'description' => 'Create hero banners'],
            ['name' => 'banners.update', 'module' => 'cms', 'description' => 'Update hero banners'],
            ['name' => 'banners.delete', 'module' => 'cms', 'description' => 'Delete hero banners'],
            ['name' => 'popups.view', 'module' => 'cms', 'description' => 'View promotional popups'],
            ['name' => 'popups.create', 'module' => 'cms', 'description' => 'Create popups'],
            ['name' => 'popups.update', 'module' => 'cms', 'description' => 'Update popups'],
            ['name' => 'popups.delete', 'module' => 'cms', 'description' => 'Delete popups'],

            // Reports & Settings
            ['name' => 'reports.view', 'module' => 'reports', 'description' => 'View sales & analytics dashboard reports'],
            ['name' => 'settings.view', 'module' => 'settings', 'description' => 'View system settings'],
            ['name' => 'settings.update', 'module' => 'settings', 'description' => 'Update store settings'],

            // Admin Users & RBAC
            ['name' => 'users.view', 'module' => 'users', 'description' => 'View admin users'],
            ['name' => 'users.create', 'module' => 'users', 'description' => 'Create admin users'],
            ['name' => 'users.update', 'module' => 'users', 'description' => 'Update admin users and roles'],
            ['name' => 'users.delete', 'module' => 'users', 'description' => 'Disable or remove admin users'],
        ];

        foreach ($permissions as $perm) {
            DB::table('permissions')->updateOrInsert(['name' => $perm['name']], array_merge($perm, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 3. Role-Permission Matrix Assignment
        $roleMap = [
            'SUPER_ADMIN' => DB::table('permissions')->pluck('name')->toArray(),
            'ADMIN' => DB::table('permissions')->where('name', 'not like', 'users.%')->pluck('name')->toArray(),
            'PRODUCT_MANAGER' => ['products.view', 'products.create', 'products.update', 'products.delete', 'categories.view', 'categories.create', 'categories.update', 'categories.delete'],
            'INVENTORY_MANAGER' => ['inventory.view', 'inventory.update'],
            'ORDER_MANAGER' => ['orders.view', 'orders.update', 'orders.cancel', 'orders.refund'],
            'MARKETING_MANAGER' => [
                'coupons.view', 'coupons.create', 'coupons.update', 'coupons.delete',
                'offers.view', 'offers.create', 'offers.update', 'offers.delete',
                'homepage.view', 'homepage.update', 'banners.view', 'banners.create', 'banners.update', 'banners.delete',
                'popups.view', 'popups.create', 'popups.update', 'popups.delete'
            ],
        ];

        foreach ($roleMap as $roleName => $permNames) {
            $roleId = DB::table('roles')->where('name', $roleName)->value('id');
            $permIds = DB::table('permissions')->whereIn('name', $permNames)->pluck('id');

            foreach ($permIds as $pId) {
                DB::table('permission_role')->updateOrInsert([
                    'permission_id' => $pId,
                    'role_id' => $roleId,
                ]);
            }
        }

        // 4. Seed Super Admin User
        $superAdminRoleId = DB::table('roles')->where('name', 'SUPER_ADMIN')->value('id');

        DB::table('users')->updateOrInsert(
            ['email' => 'admin@femmeera.com'],
            [
                'name' => 'Super Administrator',
                'phone' => '9999999999',
                'password' => Hash::make('admin123'),
                'user_type' => 'ADMIN',
                'status' => 'ACTIVE',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $adminId = DB::table('users')->where('email', 'admin@femmeera.com')->value('id');

        DB::table('role_user')->updateOrInsert([
            'role_id' => $superAdminRoleId,
            'user_id' => $adminId,
        ]);

        // 5. Seed Dynamic Categories (Women -> Traditional Wear, Western Wear)
        $womenRootId = DB::table('categories')->where('slug', 'women')->value('id');

        if (!$womenRootId) {
            $womenRootId = DB::table('categories')->insertGetId([
                'parent_id' => null,
                'name' => 'Women',
                'slug' => 'women',
                'description' => 'Women\'s Clothing Catalog',
                'sort_order' => 1,
                'status' => 'ACTIVE',
                'seo_title' => 'Women\'s Clothing Collection | Femmeera',
                'seo_description' => 'Discover traditional and western clothing for women at Femmeera.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $tradId = DB::table('categories')->where('slug', 'traditional-wear')->value('id');
        if (!$tradId) {
            $tradId = DB::table('categories')->insertGetId([
                'parent_id' => $womenRootId,
                'name' => 'Traditional Wear',
                'slug' => 'traditional-wear',
                'description' => 'Exquisite Indian traditional clothing including sarees, kurtis, lehengas, and ethnic sets.',
                'sort_order' => 1,
                'status' => 'ACTIVE',
                'seo_title' => 'Women\'s Traditional Wear | Femmeera',
                'seo_description' => 'Explore handcrafted traditional ethnic wear for women.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $westId = DB::table('categories')->where('slug', 'western-wear')->value('id');
        if (!$westId) {
            $westId = DB::table('categories')->insertGetId([
                'parent_id' => $womenRootId,
                'name' => 'Western Wear',
                'slug' => 'western-wear',
                'description' => 'Modern western wear including dresses, tops, t-shirts, jeans, and co-ord sets.',
                'sort_order' => 2,
                'status' => 'ACTIVE',
                'seo_title' => 'Women\'s Western Wear | Femmeera',
                'seo_description' => 'Explore chic and comfortable western fashion for women.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Seed Demo Products, Variants & Inventory
        $productsData = [
            [
                'category_id' => $tradId,
                'name' => 'Embroidered Silk Lehenga Set',
                'slug' => 'embroidered-silk-lehenga-set',
                'sku' => 'FMR-TRAD-LEH-001',
                'short_description' => 'Royal hand-embroidered silk lehenga set with zari dupatta.',
                'description' => 'Immerse yourself in royal splendor with our Embroidered Silk Lehenga Set. Featuring intricate zari craftsmanship, hand-embroidered borders, and a soft net dupatta, this ensemble promises timeless elegance.',
                'brand' => 'Femmeera',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
                'is_featured' => 1,
                'is_new' => 1,
                'is_best_seller' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop'
                ],
                'variants' => [
                    ['sku' => 'FMR-LEH-001-RED-S', 'size' => 'S', 'color' => 'Crimson Red', 'mrp' => 19999.00, 'price' => 14999.00, 'stock' => 15],
                    ['sku' => 'FMR-LEH-001-RED-M', 'size' => 'M', 'color' => 'Crimson Red', 'mrp' => 19999.00, 'price' => 14999.00, 'stock' => 20],
                    ['sku' => 'FMR-LEH-001-RED-L', 'size' => 'L', 'color' => 'Crimson Red', 'mrp' => 19999.00, 'price' => 14999.00, 'stock' => 10],
                    ['sku' => 'FMR-LEH-001-GLD-M', 'size' => 'M', 'color' => 'Royal Gold', 'mrp' => 19999.00, 'price' => 14999.00, 'stock' => 12],
                ]
            ],
            [
                'category_id' => $tradId,
                'name' => 'Handcrafted Banarasi Silk Saree',
                'slug' => 'handcrafted-banarasi-silk-saree',
                'sku' => 'FMR-TRAD-SAR-001',
                'short_description' => 'Handwoven Banarasi silk saree with gold zari weaving.',
                'description' => 'Crafted from pure silk, this royal Banarasi saree features rich gold zari motifs, intricate pallu borders, and comes with an unstitched matching blouse piece.',
                'brand' => 'Femmeera',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
                'is_featured' => 1,
                'is_new' => 1,
                'is_best_seller' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
                ],
                'variants' => [
                    ['sku' => 'FMR-SAR-001-RED-FS', 'size' => 'Free Size', 'color' => 'Royal Red', 'mrp' => 12999.00, 'price' => 8999.00, 'stock' => 25],
                    ['sku' => 'FMR-SAR-001-BLU-FS', 'size' => 'Free Size', 'color' => 'Peacock Blue', 'mrp' => 12999.00, 'price' => 8999.00, 'stock' => 15],
                ]
            ],
            [
                'category_id' => $tradId,
                'name' => 'Designer Anarkali Suit Set',
                'slug' => 'designer-anarkali-suit-set',
                'sku' => 'FMR-TRAD-SUIT-001',
                'short_description' => 'Flowy printed georgette Anarkali suit with embroidered neckline.',
                'description' => 'Add grace to your festive wardrobe with our Designer Anarkali Suit Set. Tailored in high-grade georgette with zari highlights and matching trousers.',
                'brand' => 'Femmeera',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
                'is_featured' => 1,
                'is_new' => 1,
                'is_best_seller' => 0,
                'images' => [
                    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop',
                ],
                'variants' => [
                    ['sku' => 'FMR-SUIT-001-PNK-S', 'size' => 'S', 'color' => 'Blush Pink', 'mrp' => 8999.00, 'price' => 6499.00, 'stock' => 18],
                    ['sku' => 'FMR-SUIT-001-PNK-M', 'size' => 'M', 'color' => 'Blush Pink', 'mrp' => 8999.00, 'price' => 6499.00, 'stock' => 22],
                ]
            ],
            [
                'category_id' => $westId,
                'name' => 'Linen Blend Premium Co-ord Set',
                'slug' => 'linen-co-ord-set',
                'sku' => 'FMR-WEST-CORD-001',
                'short_description' => 'Chic 2-piece linen shirt and trouser co-ord set.',
                'description' => 'Upgrade your wardrobe with this relaxed linen blend co-ord set. Ideal for office casuals, weekend brunches, or travel.',
                'brand' => 'Femmeera',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
                'is_featured' => 1,
                'is_new' => 1,
                'is_best_seller' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
                ],
                'variants' => [
                    ['sku' => 'FMR-CORD-001-BGE-S', 'size' => 'S', 'color' => 'Beige', 'mrp' => 4999.00, 'price' => 3499.00, 'stock' => 30],
                    ['sku' => 'FMR-CORD-001-BGE-M', 'size' => 'M', 'color' => 'Beige', 'mrp' => 4999.00, 'price' => 3499.00, 'stock' => 35],
                    ['sku' => 'FMR-CORD-001-BLK-M', 'size' => 'M', 'color' => 'Black', 'mrp' => 4999.00, 'price' => 3499.00, 'stock' => 20],
                ]
            ],
            [
                'category_id' => $tradId,
                'name' => 'Chanderi Printed Kurti Set',
                'slug' => 'chanderi-printed-kurti-set',
                'sku' => 'FMR-TRAD-KUR-001',
                'short_description' => 'Lightweight Chanderi cotton kurti with dupatta.',
                'description' => 'Soft, comfortable, and elegant. Features subtle foil print and intricate neck embroidery for daily ethnic wear.',
                'brand' => 'Femmeera',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
                'is_featured' => 1,
                'is_new' => 1,
                'is_best_seller' => 0,
                'images' => [
                    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1200&auto=format&fit=crop',
                ],
                'variants' => [
                    ['sku' => 'FMR-KUR-001-YEL-S', 'size' => 'S', 'color' => 'Mustard Yellow', 'mrp' => 3999.00, 'price' => 2499.00, 'stock' => 25],
                    ['sku' => 'FMR-KUR-001-YEL-M', 'size' => 'M', 'color' => 'Mustard Yellow', 'mrp' => 3999.00, 'price' => 2499.00, 'stock' => 40],
                ]
            ],
            [
                'category_id' => $westId,
                'name' => 'Indo-Western Velvet Evening Gown',
                'slug' => 'indo-western-velvet-glen-gown',
                'sku' => 'FMR-WEST-GWN-001',
                'short_description' => 'Rich velvet evening gown with zardozi belt detail.',
                'description' => 'Make a high-fashion statement at reception dinners and gala events with this luxurious dark velvet gown.',
                'brand' => 'Femmeera',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
                'is_featured' => 1,
                'is_new' => 1,
                'is_best_seller' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop',
                ],
                'variants' => [
                    ['sku' => 'FMR-GWN-001-NVY-S', 'size' => 'S', 'color' => 'Navy Blue', 'mrp' => 15999.00, 'price' => 11999.00, 'stock' => 12],
                    ['sku' => 'FMR-GWN-001-NVY-M', 'size' => 'M', 'color' => 'Navy Blue', 'mrp' => 15999.00, 'price' => 11999.00, 'stock' => 15],
                ]
            ],
        ];

        foreach ($productsData as $prodData) {
            $variants = $prodData['variants'];
            unset($prodData['variants']);
            $images = $prodData['images'] ?? [];
            unset($prodData['images']);

            $productId = DB::table('products')->where('sku', $prodData['sku'])->value('id');

            if (!$productId) {
                $productId = DB::table('products')->insertGetId(array_merge($prodData, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }

            foreach ($images as $sortIdx => $imgUrl) {
                DB::table('product_images')->updateOrInsert(
                    ['product_id' => $productId, 'image_url' => $imgUrl],
                    ['sort_order' => $sortIdx + 1, 'is_primary' => $sortIdx === 0 ? 1 : 0, 'created_at' => now(), 'updated_at' => now()]
                );
            }

            foreach ($variants as $var) {
                $variantId = DB::table('product_variants')->where('sku', $var['sku'])->value('id');

                if (!$variantId) {
                    $variantId = DB::table('product_variants')->insertGetId([
                        'product_id' => $productId,
                        'sku' => $var['sku'],
                        'size' => $var['size'],
                        'color' => $var['color'],
                        'mrp' => $var['mrp'],
                        'price' => $var['price'],
                        'stock' => $var['stock'],
                        'low_stock_threshold' => 5,
                        'status' => 'ACTIVE',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                DB::table('inventory')->updateOrInsert(
                    ['variant_id' => $variantId],
                    [
                        'available_quantity' => $var['stock'],
                        'reserved_quantity' => 0,
                        'low_stock_threshold' => 5,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );

                DB::table('inventory_transactions')->updateOrInsert(
                    ['variant_id' => $variantId, 'reference_id' => 'INIT-PO-2026'],
                    [
                        'type' => 'PURCHASE',
                        'quantity' => $var['stock'],
                        'reference_type' => 'PURCHASE_ORDER',
                        'notes' => 'Initial stock intake for demo product launch',
                        'created_by' => $adminId,
                        'created_at' => now(),
                    ]
                );
            }
        }

        // 7. Seed Default System Settings
        $settings = [
            ['group_name' => 'general', 'key_name' => 'store_name', 'value_content' => 'Femmeera'],
            ['group_name' => 'general', 'key_name' => 'store_currency', 'value_content' => 'INR'],
            ['group_name' => 'general', 'key_name' => 'currency_symbol', 'value_content' => '₹'],
            ['group_name' => 'shipping', 'key_name' => 'free_shipping_threshold', 'value_content' => '1999'],
            ['group_name' => 'seo', 'key_name' => 'default_meta_title', 'value_content' => 'Femmeera | Elegant Women\'s Traditional & Western Clothing'],
            ['group_name' => 'seo', 'key_name' => 'default_meta_description', 'value_content' => 'Shop premium sarees, kurtis, dresses, tops, and western trends at Femmeera.'],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(['key_name' => $setting['key_name']], array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 8. Seed Homepage Sections
        $homepageSections = [
            ['type' => 'HERO', 'title' => 'Festive Collection 2026', 'subtitle' => 'Handcrafted Sarees & Kurtis', 'sort_order' => 1, 'status' => 'ACTIVE'],
            ['type' => 'CATEGORY_GRID', 'title' => 'Shop By Category', 'subtitle' => 'Explore Traditional & Western Trends', 'sort_order' => 2, 'status' => 'ACTIVE'],
            ['type' => 'PRODUCT_GRID', 'title' => 'Fresh New Arrivals', 'subtitle' => 'Handpicked for You', 'sort_order' => 3, 'status' => 'ACTIVE'],
            ['type' => 'BANNER', 'title' => 'Flat 20% Off Festive Edit', 'subtitle' => 'Use code FESTIVE20 at checkout', 'sort_order' => 4, 'status' => 'ACTIVE'],
        ];

        foreach ($homepageSections as $sec) {
            DB::table('homepage_sections')->updateOrInsert(['type' => $sec['type'], 'title' => $sec['title']], array_merge($sec, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 9. Seed Phase 7 Shipping Methods
        $shippingMethods = [
            ['name' => 'Standard Delivery', 'description' => 'Reliable doorstep delivery across India in 3–5 business days.', 'price' => 49.00, 'estimated_min_days' => 3, 'estimated_max_days' => 5, 'status' => 'ACTIVE'],
            ['name' => 'Express Delivery', 'description' => 'Priority express delivery in 1–2 business days.', 'price' => 99.00, 'estimated_min_days' => 1, 'estimated_max_days' => 2, 'status' => 'ACTIVE'],
        ];

        foreach ($shippingMethods as $method) {
            DB::table('shipping_methods')->updateOrInsert(['name' => $method['name']], array_merge($method, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 10. Seed Tax Rules (GST Standard)
        $taxRules = [
            ['name' => 'GST Apparel 5%', 'rate_percentage' => 5.00, 'is_inclusive' => 0, 'status' => 'ACTIVE'],
        ];

        foreach ($taxRules as $tax) {
            DB::table('tax_rules')->updateOrInsert(['name' => $tax['name']], array_merge($tax, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 11. Seed Sample Coupons & Offers
        $coupons = [
            [
                'code' => 'WELCOME10',
                'name' => 'Welcome 10% Discount',
                'description' => 'Get 10% off on your first order above ₹999.',
                'discount_type' => 'PERCENTAGE',
                'discount_value' => 10.00,
                'minimum_order_amount' => 999.00,
                'maximum_discount_amount' => 500.00,
                'usage_limit' => 1000,
                'usage_limit_per_customer' => 1,
                'start_at' => now()->subDays(1),
                'end_at' => now()->addMonths(6),
                'status' => 'ACTIVE',
            ],
            [
                'code' => 'FESTIVE20',
                'name' => 'Festive Edit 20% Off',
                'description' => 'Enjoy 20% flat discount on orders above ₹1499.',
                'discount_type' => 'PERCENTAGE',
                'discount_value' => 20.00,
                'minimum_order_amount' => 1499.00,
                'maximum_discount_amount' => 800.00,
                'usage_limit' => 500,
                'usage_limit_per_customer' => 2,
                'start_at' => now()->subDays(1),
                'end_at' => now()->addMonths(3),
                'status' => 'ACTIVE',
            ]
        ];

        // 12. Seed Watch and Shop 9:16 Fashion Reels
        $reels = [
            [
                'title' => 'Royal Bridal Silk Lehenga Look',
                'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-red-dress-41334-large.mp4',
                'poster_url' => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
                'product_url' => '/product/embroidered-silk-lehenga-set',
                'button_text' => 'View Product',
                'sort_order' => 1,
                'status' => 'ACTIVE',
            ],
            [
                'title' => 'Handcrafted Banarasi Saree Elegance',
                'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-for-the-camera-in-a-studio-41337-large.mp4',
                'poster_url' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
                'product_url' => '/product/handcrafted-banarasi-silk-saree',
                'button_text' => 'View Product',
                'sort_order' => 2,
                'status' => 'ACTIVE',
            ],
            [
                'title' => 'Summer Linen Co-ord Outfit',
                'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-posing-in-a-flower-field-41335-large.mp4',
                'poster_url' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
                'product_url' => '/product/linen-co-ord-set',
                'button_text' => 'View Product',
                'sort_order' => 3,
                'status' => 'ACTIVE',
            ],
            [
                'title' => 'Designer Anarkali Suit Motion',
                'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-model-walking-in-a-fashion-show-41333-large.mp4',
                'poster_url' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop',
                'product_url' => '/product/designer-anarkali-suit-set',
                'button_text' => 'View Product',
                'sort_order' => 4,
                'status' => 'ACTIVE',
            ],
        ];

        foreach ($reels as $r) {
            DB::table('watch_and_shop_videos')->updateOrInsert(['title' => $r['title']], array_merge($r, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}

