-- ========================================================
-- Femmeera Store Complete SQL Database Dump
-- Database: femmeera_db
-- Generated: 2026-08-25 15:50:29
-- ========================================================

SET FOREIGN_KEY_CHECKS=0;

-- --------------------------------------------------------
-- Table structure for `announcements`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `background_color` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#000000',
  `text_color` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#FFFFFF',
  `status` enum('ACTIVE','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `attribute_values`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `attribute_values`;
CREATE TABLE `attribute_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `attribute_id` bigint unsigned NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attribute_values_attribute_id_slug_unique` (`attribute_id`,`slug`),
  CONSTRAINT `attribute_values_attribute_id_foreign` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `attributes`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `attributes`;
CREATE TABLE `attributes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('SELECT','MULTISELECT','TEXT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SELECT',
  `is_filterable` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attributes_name_unique` (`name`),
  UNIQUE KEY `attributes_code_unique` (`code`),
  KEY `attributes_code_index` (`code`),
  KEY `attributes_is_filterable_index` (`is_filterable`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `audit_logs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_action_created_at_index` (`user_id`,`action`,`created_at`),
  CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `cache`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `cache_locks`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `cart_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cart_id` bigint unsigned NOT NULL,
  `variant_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_items_cart_id_variant_id_unique` (`cart_id`,`variant_id`),
  KEY `cart_items_variant_id_foreign` (`variant_id`),
  CONSTRAINT `cart_items_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `cart_items` (1 rows)
INSERT INTO `cart_items` (`id`, `cart_id`, `variant_id`, `quantity`, `created_at`, `updated_at`) VALUES (7, 7, 15, 1, '2026-08-25 15:45:12', '2026-08-25 15:45:12');

-- --------------------------------------------------------
-- Table structure for `carts`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned DEFAULT NULL,
  `guest_session_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','CONVERTED','ABANDONED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `last_activity_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `carts_customer_id_status_index` (`customer_id`,`status`),
  KEY `carts_guest_session_id_status_index` (`guest_session_id`,`status`),
  KEY `carts_guest_session_id_index` (`guest_session_id`),
  CONSTRAINT `carts_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `carts` (1 rows)
INSERT INTO `carts` (`id`, `customer_id`, `guest_session_id`, `status`, `last_activity_at`, `created_at`, `updated_at`) VALUES (7, NULL, 'guest_ay6rtostkms_1787459006116', 'ACTIVE', '2026-08-25 15:45:14', '2026-08-25 15:45:09', '2026-08-25 15:45:14');

-- --------------------------------------------------------
-- Table structure for `categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','DISABLED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `categories_parent_id_index` (`parent_id`),
  KEY `categories_slug_index` (`slug`),
  KEY `categories_status_index` (`status`),
  CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `categories` (3 rows)
INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `description`, `image_url`, `banner_url`, `sort_order`, `status`, `seo_title`, `seo_description`, `created_at`, `updated_at`) VALUES (1, NULL, 'Women', 'women', 'Women\'s Clothing Catalog', NULL, NULL, 1, 'ACTIVE', 'Women\'s Clothing Collection | Femmeera', 'Discover traditional and western clothing for women at Femmeera.', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `description`, `image_url`, `banner_url`, `sort_order`, `status`, `seo_title`, `seo_description`, `created_at`, `updated_at`) VALUES (2, 1, 'Traditional Wear', 'traditional-wear', 'Exquisite Indian traditional clothing including sarees, kurtis, lehengas, and ethnic sets.', NULL, NULL, 1, 'ACTIVE', 'Women\'s Traditional Wear | Femmeera', 'Explore handcrafted traditional ethnic wear for women.', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `description`, `image_url`, `banner_url`, `sort_order`, `status`, `seo_title`, `seo_description`, `created_at`, `updated_at`) VALUES (3, 1, 'Western Wear', 'western-wear', 'Modern western wear including dresses, tops, t-shirts, jeans, and co-ord sets.', NULL, NULL, 2, 'ACTIVE', 'Women\'s Western Wear | Femmeera', 'Explore chic and comfortable western fashion for women.', '2026-08-25 15:41:39', '2026-08-25 15:41:39');

-- --------------------------------------------------------
-- Table structure for `collections`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `collections`;
CREATE TABLE `collections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `banner_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `collections_slug_unique` (`slug`),
  KEY `idx_coll_status_feat` (`status`,`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `coupon_usages`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `coupon_usages`;
CREATE TABLE `coupon_usages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `coupon_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `order_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `coupon_usages_coupon_id_foreign` (`coupon_id`),
  KEY `coupon_usages_user_id_foreign` (`user_id`),
  KEY `coupon_usages_order_id_foreign` (`order_id`),
  CONSTRAINT `coupon_usages_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_usages_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `coupon_usages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `coupons`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `influencer_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `influencer_handle` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `influencer_commission_percent` decimal(5,2) DEFAULT '0.00',
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_type` enum('PERCENTAGE','FIXED_AMOUNT','FREE_SHIPPING') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PERCENTAGE',
  `discount_value` decimal(10,2) NOT NULL,
  `minimum_order_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `maximum_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `usage_limit_per_customer` int DEFAULT NULL,
  `start_at` timestamp NULL DEFAULT NULL,
  `end_at` timestamp NULL DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `coupons` (1 rows)
INSERT INTO `coupons` (`id`, `code`, `name`, `influencer_name`, `influencer_handle`, `influencer_commission_percent`, `description`, `discount_type`, `discount_value`, `minimum_order_amount`, `maximum_discount_amount`, `usage_limit`, `usage_limit_per_customer`, `start_at`, `end_at`, `status`, `created_at`, `updated_at`) VALUES (2, 'PRIYANKA20', 'Priyanka Sharma Festive Promo', 'Priyanka Sharma', '@priyanka_couture', 10.00, NULL, 'PERCENTAGE', 20.00, 1000.00, 2000.00, 100, NULL, NULL, NULL, 'ACTIVE', '2026-08-25 15:50:13', '2026-08-25 15:50:13');

-- --------------------------------------------------------
-- Table structure for `customer_addresses`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `customer_addresses`;
CREATE TABLE `customer_addresses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `type` enum('SHIPPING','BILLING') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SHIPPING',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line_1` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line_2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `landmark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'India',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_addresses_customer_id_foreign` (`customer_id`),
  CONSTRAINT `customer_addresses_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `email_notification_settings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `email_notification_settings`;
CREATE TABLE `email_notification_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `event_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_type` enum('customer','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `subject_template` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_notification_settings_event_key_unique` (`event_key`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `email_notification_settings` (15 rows)
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (1, 'welcome_email', 'Welcome Email', 'Sent to new customers upon account registration.', 'customer', 1, 'Welcome to Femmeera - Exclusive Luxury Fashion', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (2, 'order_confirmation', 'Order Confirmation', 'Sent after payment verification or COD checkout.', 'customer', 1, 'Order Confirmation - Femmeera #{order_number}', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (3, 'payment_confirmation', 'Payment Receipt', 'Sent after successful Razorpay payment verification.', 'customer', 1, 'Payment Received for Order #{order_number}', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (4, 'order_processing', 'Order Processing', 'Sent when order status changes to Processing.', 'customer', 1, 'Your Order #{order_number} is being Processed', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (5, 'order_shipped', 'Order Shipped', 'Sent when order status changes to Shipped.', 'customer', 1, 'Your Order #{order_number} has been Shipped!', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (6, 'order_delivered', 'Order Delivered', 'Sent when order status changes to Delivered.', 'customer', 1, 'Your Order #{order_number} has been Delivered', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (7, 'return_requested', 'Return Requested', 'Sent to customer when return request is submitted.', 'customer', 1, 'Return Request Received for Order #{order_number}', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (8, 'return_approved', 'Return Approved', 'Sent when admin approves a return request.', 'customer', 1, 'Return Request Approved for Order #{order_number}', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (9, 'return_rejected', 'Return Rejected', 'Sent when admin rejects a return request.', 'customer', 1, 'Update on Return Request for Order #{order_number}', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (10, 'refund_initiated', 'Refund Initiated', 'Sent when refund processing is initiated.', 'customer', 1, 'Refund Initiated for Order #{order_number}', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (11, 'refund_completed', 'Refund Completed', 'Sent when refund is completed.', 'customer', 1, 'Refund Processed Successfully for Order #{order_number}', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (12, 'password_reset', 'Password Reset', 'Sent when customer requests password reset link.', 'customer', 1, 'Reset Your Femmeera Account Password', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (13, 'admin_new_order', 'Admin: New Order Placed', 'Notification to admin when a new order is verified.', 'admin', 1, '[ALERT] New Order Placed #{order_number}', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (14, 'admin_new_return', 'Admin: New Return Request', 'Notification to admin when customer files return.', 'admin', 1, '[ALERT] New Return Request for Order #{order_number}', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `email_notification_settings` (`id`, `event_key`, `name`, `description`, `recipient_type`, `is_enabled`, `subject_template`, `created_at`, `updated_at`) VALUES (15, 'admin_payment_failure', 'Admin: Payment Failure', 'Notification to admin when payment verification fails.', 'admin', 1, '[ALERT] Payment Verification Failed for Order #{order_number}', '2026-08-25 15:41:38', '2026-08-25 15:41:38');

-- --------------------------------------------------------
-- Table structure for `failed_jobs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `hero_banners`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `hero_banners`;
CREATE TABLE `hero_banners` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile_image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `button_text` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('ACTIVE','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `homepage_sections`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `homepage_sections`;
CREATE TABLE `homepage_sections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('HERO','PRODUCT_GRID','BANNER','CATEGORY_GRID','TESTIMONIAL','TEXT','NEWSLETTER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_text` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `homepage_sections` (4 rows)
INSERT INTO `homepage_sections` (`id`, `type`, `title`, `subtitle`, `content`, `image_url`, `button_text`, `button_url`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES (1, 'HERO', 'Festive Collection 2026', 'Handcrafted Sarees & Kurtis', NULL, NULL, NULL, NULL, 1, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `homepage_sections` (`id`, `type`, `title`, `subtitle`, `content`, `image_url`, `button_text`, `button_url`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES (2, 'CATEGORY_GRID', 'Shop By Category', 'Explore Traditional & Western Trends', NULL, NULL, NULL, NULL, 2, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `homepage_sections` (`id`, `type`, `title`, `subtitle`, `content`, `image_url`, `button_text`, `button_url`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES (3, 'PRODUCT_GRID', 'Fresh New Arrivals', 'Handpicked for You', NULL, NULL, NULL, NULL, 3, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `homepage_sections` (`id`, `type`, `title`, `subtitle`, `content`, `image_url`, `button_text`, `button_url`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES (4, 'BANNER', 'Flat 20% Off Festive Edit', 'Use code FESTIVE20 at checkout', NULL, NULL, NULL, NULL, 4, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');

-- --------------------------------------------------------
-- Table structure for `inventory`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `variant_id` bigint unsigned NOT NULL,
  `available_quantity` int NOT NULL DEFAULT '0',
  `reserved_quantity` int NOT NULL DEFAULT '0',
  `low_stock_threshold` int NOT NULL DEFAULT '5',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_variant_id_unique` (`variant_id`),
  KEY `inventory_variant_id_index` (`variant_id`),
  CONSTRAINT `inventory_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `inventory` (15 rows)
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (1, 1, 15, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (2, 2, 20, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (3, 3, 10, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (4, 4, 12, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (5, 5, 25, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (6, 6, 15, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (7, 7, 18, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (8, 8, 22, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (9, 9, 30, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (10, 10, 35, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (11, 11, 20, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (12, 12, 25, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (13, 13, 40, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (14, 14, 12, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `inventory` (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`, `created_at`, `updated_at`) VALUES (15, 15, 15, 0, 5, '2026-08-25 15:41:39', '2026-08-25 15:41:39');

-- --------------------------------------------------------
-- Table structure for `inventory_transactions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `inventory_transactions`;
CREATE TABLE `inventory_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `variant_id` bigint unsigned NOT NULL,
  `type` enum('PURCHASE','SALE','RETURN','CANCELLATION','DAMAGE','ADJUSTMENT','RESERVATION','RELEASE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `inventory_transactions_created_by_foreign` (`created_by`),
  KEY `inventory_transactions_variant_id_created_at_index` (`variant_id`,`created_at`),
  KEY `inventory_transactions_type_index` (`type`),
  CONSTRAINT `inventory_transactions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inventory_transactions_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `inventory_transactions` (15 rows)
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (1, 1, 'PURCHASE', 15, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (2, 2, 'PURCHASE', 20, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (3, 3, 'PURCHASE', 10, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (4, 4, 'PURCHASE', 12, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (5, 5, 'PURCHASE', 25, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (6, 6, 'PURCHASE', 15, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (7, 7, 'PURCHASE', 18, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (8, 8, 'PURCHASE', 22, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (9, 9, 'PURCHASE', 30, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (10, 10, 'PURCHASE', 35, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (11, 11, 'PURCHASE', 20, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (12, 12, 'PURCHASE', 25, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (13, 13, 'PURCHASE', 40, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (14, 14, 'PURCHASE', 12, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');
INSERT INTO `inventory_transactions` (`id`, `variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES (15, 15, 'PURCHASE', 15, 'PURCHASE_ORDER', 'INIT-PO-2026', 'Initial stock intake for demo product launch', 1, '2026-08-25 15:41:39');

-- --------------------------------------------------------
-- Table structure for `job_batches`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `jobs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `migrations`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `migrations` (23 rows)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1, '0001_01_01_000001_create_cache_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2, '0001_01_01_000002_create_jobs_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3, '2026_01_01_000000_create_personal_access_tokens_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (4, '2026_01_01_000001_create_users_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5, '2026_01_01_000002_create_rbac_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6, '2026_01_01_000003_create_catalog_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7, '2026_01_01_000004_create_inventory_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8, '2026_01_01_000005_create_cart_and_wishlist_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9, '2026_01_01_000006_create_addresses_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10, '2026_01_01_000007_create_order_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11, '2026_01_01_000008_create_payment_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (12, '2026_01_01_000009_create_marketing_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13, '2026_01_01_000010_create_review_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14, '2026_01_01_000011_create_cms_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15, '2026_01_01_000012_create_shipping_and_system_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (16, '2026_01_01_000014_create_watch_and_shop_videos_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (17, '2026_08_23_090001_create_phase7_cart_checkout_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (18, '2026_08_23_120000_create_phase8_payment_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (19, '2026_08_24_180000_add_google_id_to_users_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (20, '2026_08_24_200000_create_shipping_and_returns_tables', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (21, '2026_08_25_140000_create_email_notification_settings_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (22, '2026_08_25_150000_ensure_razorpay_indexes_and_fields', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (23, '2026_08_25_160000_add_influencer_fields_to_coupons_table', 2);

-- --------------------------------------------------------
-- Table structure for `notifications`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `offer_category`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `offer_category`;
CREATE TABLE `offer_category` (
  `offer_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`offer_id`,`category_id`),
  KEY `offer_category_category_id_foreign` (`category_id`),
  CONSTRAINT `offer_category_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `offer_category_offer_id_foreign` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `offer_product`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `offer_product`;
CREATE TABLE `offer_product` (
  `offer_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`offer_id`,`product_id`),
  KEY `offer_product_product_id_foreign` (`product_id`),
  CONSTRAINT `offer_product_offer_id_foreign` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `offer_product_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `offers`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `offers`;
CREATE TABLE `offers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('PRODUCT_DISCOUNT','CATEGORY_DISCOUNT','BUY_X_GET_Y','FREE_SHIPPING','ORDER_DISCOUNT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ORDER_DISCOUNT',
  `discount_type` enum('PERCENTAGE','FIXED_AMOUNT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PERCENTAGE',
  `discount_value` decimal(10,2) NOT NULL,
  `minimum_quantity` int NOT NULL DEFAULT '1',
  `minimum_order_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `maximum_discount` decimal(10,2) DEFAULT NULL,
  `start_at` timestamp NULL DEFAULT NULL,
  `end_at` timestamp NULL DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `order_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `variant_id` bigint unsigned NOT NULL,
  `product_name_snapshot` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku_snapshot` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size_snapshot` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color_snapshot` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_items_product_id_foreign` (`product_id`),
  KEY `order_items_variant_id_foreign` (`variant_id`),
  KEY `order_items_order_id_index` (`order_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `order_items_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `order_returns`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_returns`;
CREATE TABLE `order_returns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `order_item_id` bigint unsigned DEFAULT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `images` json DEFAULT NULL,
  `status` enum('REQUESTED','UNDER_REVIEW','APPROVED','REJECTED','PICKUP_SCHEDULED','PICKED_UP','RECEIVED','REFUND_INITIATED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REQUESTED',
  `admin_comment` text COLLATE utf8mb4_unicode_ci,
  `refund_amount` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_returns_user_id_foreign` (`user_id`),
  KEY `order_returns_order_item_id_foreign` (`order_item_id`),
  KEY `order_returns_product_id_foreign` (`product_id`),
  KEY `order_returns_order_id_user_id_status_index` (`order_id`,`user_id`,`status`),
  CONSTRAINT `order_returns_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_returns_order_item_id_foreign` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_returns_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_returns_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `order_status_history`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_status_history`;
CREATE TABLE `order_status_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `previous_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `changed_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_status_history_order_id_foreign` (`order_id`),
  KEY `order_status_history_changed_by_foreign` (`changed_by`),
  CONSTRAINT `order_status_history_changed_by_foreign` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `order_status_history_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `orders`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `shipping_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `payment_status` enum('PENDING','AUTHORIZED','PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `order_status` enum('PENDING','CONFIRMED','PROCESSING','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURN_REQUESTED','RETURNED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `shipping_address_snapshot` json NOT NULL,
  `billing_address_snapshot` json NOT NULL,
  `carrier` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`),
  KEY `orders_user_id_index` (`user_id`),
  KEY `orders_order_number_index` (`order_number`),
  KEY `orders_order_status_index` (`order_status`),
  KEY `orders_created_at_index` (`created_at`),
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `password_reset_tokens`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `payment_transactions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payment_transactions`;
CREATE TABLE `payment_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `payment_id` bigint unsigned NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PAYMENT_CREATED',
  `provider_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` json DEFAULT NULL,
  `response_data` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payment_transactions_payment_id_foreign` (`payment_id`),
  CONSTRAINT `payment_transactions_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `payments`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `provider` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RAZORPAY',
  `provider_payment_order_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_payment_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_signature` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CREATED',
  `method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `failure_reason` text COLLATE utf8mb4_unicode_ci,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_provider_payment_id_unique` (`provider_payment_id`),
  UNIQUE KEY `payments_provider_payment_order_id_unique` (`provider_payment_order_id`),
  KEY `payments_order_id_foreign` (`order_id`),
  KEY `payments_provider_payment_id_index` (`provider_payment_id`),
  CONSTRAINT `payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `permission_role`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `permission_role`;
CREATE TABLE `permission_role` (
  `permission_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `permission_role_role_id_foreign` (`role_id`),
  CONSTRAINT `permission_role_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permission_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `permission_role` (114 rows)
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (1, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (2, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (3, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (4, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (5, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (6, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (7, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (8, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (9, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (10, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (11, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (12, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (13, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (14, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (15, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (16, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (17, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (18, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (19, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (20, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (21, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (22, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (23, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (24, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (25, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (26, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (27, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (28, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (29, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (30, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (31, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (32, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (33, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (34, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (35, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (36, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (37, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (38, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (39, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (40, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (41, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (42, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (43, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (1, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (2, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (3, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (4, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (5, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (6, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (7, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (8, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (9, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (10, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (11, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (12, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (13, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (14, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (15, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (16, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (17, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (18, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (19, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (20, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (21, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (22, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (23, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (24, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (25, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (26, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (27, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (28, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (29, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (30, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (31, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (32, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (33, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (34, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (35, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (36, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (37, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (38, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (39, 2);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (1, 3);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (2, 3);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (3, 3);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (4, 3);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (5, 3);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (6, 3);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (7, 3);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (8, 3);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (9, 4);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (10, 4);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (11, 5);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (12, 5);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (13, 5);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (14, 5);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (19, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (20, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (21, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (22, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (23, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (24, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (25, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (26, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (27, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (28, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (29, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (30, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (31, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (32, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (33, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (34, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (35, 6);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (36, 6);

-- --------------------------------------------------------
-- Table structure for `permissions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `permissions` (43 rows)
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (1, 'products.view', 'catalog', 'View products', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (2, 'products.create', 'catalog', 'Create products and variants', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (3, 'products.update', 'catalog', 'Update products and variants', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (4, 'products.delete', 'catalog', 'Delete products', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (5, 'categories.view', 'catalog', 'View categories', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (6, 'categories.create', 'catalog', 'Create categories', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (7, 'categories.update', 'catalog', 'Update categories', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (8, 'categories.delete', 'catalog', 'Delete categories', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (9, 'inventory.view', 'inventory', 'View inventory stock balances', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (10, 'inventory.update', 'inventory', 'Adjust stock and record inventory transactions', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (11, 'orders.view', 'orders', 'View order history', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (12, 'orders.update', 'orders', 'Update order processing status', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (13, 'orders.cancel', 'orders', 'Cancel orders', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (14, 'orders.refund', 'orders', 'Issue order refunds', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (15, 'customers.view', 'customers', 'View customer profiles', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (16, 'customers.update', 'customers', 'Update customer status', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (17, 'reviews.view', 'reviews', 'View product reviews', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (18, 'reviews.moderate', 'reviews', 'Approve or reject customer reviews', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (19, 'coupons.view', 'marketing', 'View promo coupons', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (20, 'coupons.create', 'marketing', 'Create coupons', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (21, 'coupons.update', 'marketing', 'Update coupons', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (22, 'coupons.delete', 'marketing', 'Disable or delete coupons', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (23, 'offers.view', 'marketing', 'View promotional offers', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (24, 'offers.create', 'marketing', 'Create offers', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (25, 'offers.update', 'marketing', 'Update offers', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (26, 'offers.delete', 'marketing', 'Delete offers', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (27, 'homepage.view', 'cms', 'View homepage section layouts', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (28, 'homepage.update', 'cms', 'Update homepage sections', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (29, 'banners.view', 'cms', 'View hero banners', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (30, 'banners.create', 'cms', 'Create hero banners', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (31, 'banners.update', 'cms', 'Update hero banners', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (32, 'banners.delete', 'cms', 'Delete hero banners', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (33, 'popups.view', 'cms', 'View promotional popups', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (34, 'popups.create', 'cms', 'Create popups', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (35, 'popups.update', 'cms', 'Update popups', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (36, 'popups.delete', 'cms', 'Delete popups', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (37, 'reports.view', 'reports', 'View sales & analytics dashboard reports', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (38, 'settings.view', 'settings', 'View system settings', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (39, 'settings.update', 'settings', 'Update store settings', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (40, 'users.view', 'users', 'View admin users', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (41, 'users.create', 'users', 'Create admin users', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (42, 'users.update', 'users', 'Update admin users and roles', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES (43, 'users.delete', 'users', 'Disable or remove admin users', '2026-08-25 15:41:39', '2026-08-25 15:41:39');

-- --------------------------------------------------------
-- Table structure for `personal_access_tokens`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `popups`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `popups`;
CREATE TABLE `popups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_text` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delay_seconds` int NOT NULL DEFAULT '3',
  `frequency` int NOT NULL DEFAULT '1',
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('ACTIVE','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `product_attribute_values`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `product_attribute_values`;
CREATE TABLE `product_attribute_values` (
  `product_id` bigint unsigned NOT NULL,
  `attribute_value_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`product_id`,`attribute_value_id`),
  KEY `product_attribute_values_attribute_value_id_index` (`attribute_value_id`),
  CONSTRAINT `product_attribute_values_attribute_value_id_foreign` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_attribute_values_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `product_images`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `product_variant_id` bigint unsigned DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_images_product_variant_id_foreign` (`product_variant_id`),
  KEY `idx_img_prod_sort` (`product_id`,`sort_order`),
  CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_images_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `product_images` (9 rows)
INSERT INTO `product_images` (`id`, `product_id`, `product_variant_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`, `updated_at`) VALUES (1, 1, NULL, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop', NULL, 1, 1, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_images` (`id`, `product_id`, `product_variant_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`, `updated_at`) VALUES (2, 1, NULL, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop', NULL, 2, 0, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_images` (`id`, `product_id`, `product_variant_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`, `updated_at`) VALUES (3, 1, NULL, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop', NULL, 3, 0, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_images` (`id`, `product_id`, `product_variant_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`, `updated_at`) VALUES (4, 2, NULL, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop', NULL, 1, 1, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_images` (`id`, `product_id`, `product_variant_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`, `updated_at`) VALUES (5, 2, NULL, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop', NULL, 2, 0, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_images` (`id`, `product_id`, `product_variant_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`, `updated_at`) VALUES (6, 3, NULL, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop', NULL, 1, 1, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_images` (`id`, `product_id`, `product_variant_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`, `updated_at`) VALUES (7, 4, NULL, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop', NULL, 1, 1, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_images` (`id`, `product_id`, `product_variant_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`, `updated_at`) VALUES (8, 5, NULL, 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1200&auto=format&fit=crop', NULL, 1, 1, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_images` (`id`, `product_id`, `product_variant_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`, `updated_at`) VALUES (9, 6, NULL, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop', NULL, 1, 1, '2026-08-25 15:41:39', '2026-08-25 15:41:39');

-- --------------------------------------------------------
-- Table structure for `product_variants`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `mrp` decimal(12,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `low_stock_threshold` int NOT NULL DEFAULT '5',
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_variants_product_id_size_color_unique` (`product_id`,`size`,`color`),
  UNIQUE KEY `product_variants_sku_unique` (`sku`),
  KEY `product_variants_product_id_index` (`product_id`),
  KEY `product_variants_sku_index` (`sku`),
  KEY `product_variants_status_index` (`status`),
  CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `product_variants` (15 rows)
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (1, 1, 'FMR-LEH-001-RED-S', 'S', 'Crimson Red', 14999.00, 19999.00, 15, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (2, 1, 'FMR-LEH-001-RED-M', 'M', 'Crimson Red', 14999.00, 19999.00, 20, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (3, 1, 'FMR-LEH-001-RED-L', 'L', 'Crimson Red', 14999.00, 19999.00, 10, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (4, 1, 'FMR-LEH-001-GLD-M', 'M', 'Royal Gold', 14999.00, 19999.00, 12, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (5, 2, 'FMR-SAR-001-RED-FS', 'Free Size', 'Royal Red', 8999.00, 12999.00, 25, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (6, 2, 'FMR-SAR-001-BLU-FS', 'Free Size', 'Peacock Blue', 8999.00, 12999.00, 15, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (7, 3, 'FMR-SUIT-001-PNK-S', 'S', 'Blush Pink', 6499.00, 8999.00, 18, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (8, 3, 'FMR-SUIT-001-PNK-M', 'M', 'Blush Pink', 6499.00, 8999.00, 22, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (9, 4, 'FMR-CORD-001-BGE-S', 'S', 'Beige', 3499.00, 4999.00, 30, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (10, 4, 'FMR-CORD-001-BGE-M', 'M', 'Beige', 3499.00, 4999.00, 35, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (11, 4, 'FMR-CORD-001-BLK-M', 'M', 'Black', 3499.00, 4999.00, 20, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (12, 5, 'FMR-KUR-001-YEL-S', 'S', 'Mustard Yellow', 2499.00, 3999.00, 25, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (13, 5, 'FMR-KUR-001-YEL-M', 'M', 'Mustard Yellow', 2499.00, 3999.00, 40, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (14, 6, 'FMR-GWN-001-NVY-S', 'S', 'Navy Blue', 11999.00, 15999.00, 12, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`, `created_at`, `updated_at`) VALUES (15, 6, 'FMR-GWN-001-NVY-M', 'M', 'Navy Blue', 11999.00, 15999.00, 15, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');

-- --------------------------------------------------------
-- Table structure for `products`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `collection_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Femmeera',
  `shipping_type` enum('READY_TO_SHIP','MADE_TO_ORDER','EXPRESS') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'READY_TO_SHIP',
  `delivery_estimate` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '3-7 working days',
  `return_policy_type` enum('RETURNABLE','NON_RETURNABLE','EXCHANGE_ONLY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RETURNABLE',
  `gender` enum('WOMEN','MEN','UNISEX') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'WOMEN',
  `status` enum('ACTIVE','INACTIVE','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_new` tinyint(1) NOT NULL DEFAULT '0',
  `is_best_seller` tinyint(1) NOT NULL DEFAULT '0',
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  UNIQUE KEY `products_sku_unique` (`sku`),
  KEY `products_collection_id_foreign` (`collection_id`),
  KEY `products_slug_index` (`slug`),
  KEY `products_category_id_index` (`category_id`),
  KEY `products_status_index` (`status`),
  KEY `products_created_at_index` (`created_at`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `products_collection_id_foreign` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `products` (6 rows)
INSERT INTO `products` (`id`, `category_id`, `collection_id`, `name`, `slug`, `sku`, `description`, `short_description`, `brand`, `shipping_type`, `delivery_estimate`, `return_policy_type`, `gender`, `status`, `is_featured`, `is_new`, `is_best_seller`, `seo_title`, `seo_description`, `created_at`, `updated_at`) VALUES (1, 2, NULL, 'Embroidered Silk Lehenga Set', 'embroidered-silk-lehenga-set', 'FMR-TRAD-LEH-001', 'Immerse yourself in royal splendor with our Embroidered Silk Lehenga Set. Featuring intricate zari craftsmanship, hand-embroidered borders, and a soft net dupatta, this ensemble promises timeless elegance.', 'Royal hand-embroidered silk lehenga set with zari dupatta.', 'Femmeera', 'READY_TO_SHIP', '3-7 working days', 'RETURNABLE', 'WOMEN', 'ACTIVE', 1, 1, 1, NULL, NULL, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `products` (`id`, `category_id`, `collection_id`, `name`, `slug`, `sku`, `description`, `short_description`, `brand`, `shipping_type`, `delivery_estimate`, `return_policy_type`, `gender`, `status`, `is_featured`, `is_new`, `is_best_seller`, `seo_title`, `seo_description`, `created_at`, `updated_at`) VALUES (2, 2, NULL, 'Handcrafted Banarasi Silk Saree', 'handcrafted-banarasi-silk-saree', 'FMR-TRAD-SAR-001', 'Crafted from pure silk, this royal Banarasi saree features rich gold zari motifs, intricate pallu borders, and comes with an unstitched matching blouse piece.', 'Handwoven Banarasi silk saree with gold zari weaving.', 'Femmeera', 'READY_TO_SHIP', '3-7 working days', 'RETURNABLE', 'WOMEN', 'ACTIVE', 1, 1, 1, NULL, NULL, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `products` (`id`, `category_id`, `collection_id`, `name`, `slug`, `sku`, `description`, `short_description`, `brand`, `shipping_type`, `delivery_estimate`, `return_policy_type`, `gender`, `status`, `is_featured`, `is_new`, `is_best_seller`, `seo_title`, `seo_description`, `created_at`, `updated_at`) VALUES (3, 2, NULL, 'Designer Anarkali Suit Set', 'designer-anarkali-suit-set', 'FMR-TRAD-SUIT-001', 'Add grace to your festive wardrobe with our Designer Anarkali Suit Set. Tailored in high-grade georgette with zari highlights and matching trousers.', 'Flowy printed georgette Anarkali suit with embroidered neckline.', 'Femmeera', 'READY_TO_SHIP', '3-7 working days', 'RETURNABLE', 'WOMEN', 'ACTIVE', 1, 1, 0, NULL, NULL, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `products` (`id`, `category_id`, `collection_id`, `name`, `slug`, `sku`, `description`, `short_description`, `brand`, `shipping_type`, `delivery_estimate`, `return_policy_type`, `gender`, `status`, `is_featured`, `is_new`, `is_best_seller`, `seo_title`, `seo_description`, `created_at`, `updated_at`) VALUES (4, 3, NULL, 'Linen Blend Premium Co-ord Set', 'linen-co-ord-set', 'FMR-WEST-CORD-001', 'Upgrade your wardrobe with this relaxed linen blend co-ord set. Ideal for office casuals, weekend brunches, or travel.', 'Chic 2-piece linen shirt and trouser co-ord set.', 'Femmeera', 'READY_TO_SHIP', '3-7 working days', 'RETURNABLE', 'WOMEN', 'ACTIVE', 1, 1, 1, NULL, NULL, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `products` (`id`, `category_id`, `collection_id`, `name`, `slug`, `sku`, `description`, `short_description`, `brand`, `shipping_type`, `delivery_estimate`, `return_policy_type`, `gender`, `status`, `is_featured`, `is_new`, `is_best_seller`, `seo_title`, `seo_description`, `created_at`, `updated_at`) VALUES (5, 2, NULL, 'Chanderi Printed Kurti Set', 'chanderi-printed-kurti-set', 'FMR-TRAD-KUR-001', 'Soft, comfortable, and elegant. Features subtle foil print and intricate neck embroidery for daily ethnic wear.', 'Lightweight Chanderi cotton kurti with dupatta.', 'Femmeera', 'READY_TO_SHIP', '3-7 working days', 'RETURNABLE', 'WOMEN', 'ACTIVE', 1, 1, 0, NULL, NULL, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `products` (`id`, `category_id`, `collection_id`, `name`, `slug`, `sku`, `description`, `short_description`, `brand`, `shipping_type`, `delivery_estimate`, `return_policy_type`, `gender`, `status`, `is_featured`, `is_new`, `is_best_seller`, `seo_title`, `seo_description`, `created_at`, `updated_at`) VALUES (6, 3, NULL, 'Indo-Western Velvet Evening Gown', 'indo-western-velvet-glen-gown', 'FMR-WEST-GWN-001', 'Make a high-fashion statement at reception dinners and gala events with this luxurious dark velvet gown.', 'Rich velvet evening gown with zardozi belt detail.', 'Femmeera', 'READY_TO_SHIP', '3-7 working days', 'RETURNABLE', 'WOMEN', 'ACTIVE', 1, 1, 1, NULL, NULL, '2026-08-25 15:41:39', '2026-08-25 15:41:39');

-- --------------------------------------------------------
-- Table structure for `refunds`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `refunds`;
CREATE TABLE `refunds` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `payment_id` bigint unsigned NOT NULL,
  `order_id` bigint unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` enum('REQUESTED','PROCESSING','COMPLETED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REQUESTED',
  `provider_refund_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `refunds_provider_refund_id_unique` (`provider_refund_id`),
  KEY `refunds_payment_id_foreign` (`payment_id`),
  KEY `refunds_order_id_foreign` (`order_id`),
  KEY `refunds_created_by_foreign` (`created_by`),
  CONSTRAINT `refunds_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `refunds_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `refunds_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `review_images`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `review_images`;
CREATE TABLE `review_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `review_id` bigint unsigned NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `review_images_review_id_foreign` (`review_id`),
  CONSTRAINT `review_images_review_id_foreign` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `reviews`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `order_item_id` bigint unsigned DEFAULT NULL,
  `rating` tinyint unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_order_item_id_foreign` (`order_item_id`),
  KEY `reviews_product_id_index` (`product_id`),
  KEY `reviews_user_id_index` (`user_id`),
  CONSTRAINT `reviews_order_item_id_foreign` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `role_user`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `role_user`;
CREATE TABLE `role_user` (
  `role_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`user_id`),
  KEY `role_user_user_id_foreign` (`user_id`),
  CONSTRAINT `role_user_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `role_user` (1 rows)
INSERT INTO `role_user` (`role_id`, `user_id`) VALUES (1, 1);

-- --------------------------------------------------------
-- Table structure for `roles`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `roles` (6 rows)
INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `created_at`, `updated_at`) VALUES (1, 'SUPER_ADMIN', 'Super Administrator', 'Full unrestricted system access', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `created_at`, `updated_at`) VALUES (2, 'ADMIN', 'Administrator', 'General store administration', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `created_at`, `updated_at`) VALUES (3, 'PRODUCT_MANAGER', 'Product Manager', 'Catalog, category, and collection management', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `created_at`, `updated_at`) VALUES (4, 'INVENTORY_MANAGER', 'Inventory Manager', 'Stock balance adjustments and warehouse tracking', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `created_at`, `updated_at`) VALUES (5, 'ORDER_MANAGER', 'Order Manager', 'Order fulfillment and shipping updates', '2026-08-25 15:41:38', '2026-08-25 15:41:38');
INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `created_at`, `updated_at`) VALUES (6, 'MARKETING_MANAGER', 'Marketing Manager', 'Coupons, offers, hero banners, and popups', '2026-08-25 15:41:38', '2026-08-25 15:41:38');

-- --------------------------------------------------------
-- Table structure for `sessions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `settings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `group_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `key_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_content` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_name_unique` (`key_name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `settings` (6 rows)
INSERT INTO `settings` (`id`, `group_name`, `key_name`, `value_content`, `created_at`, `updated_at`) VALUES (1, 'general', 'store_name', 'Femmeera', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `settings` (`id`, `group_name`, `key_name`, `value_content`, `created_at`, `updated_at`) VALUES (2, 'general', 'store_currency', 'INR', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `settings` (`id`, `group_name`, `key_name`, `value_content`, `created_at`, `updated_at`) VALUES (3, 'general', 'currency_symbol', '₹', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `settings` (`id`, `group_name`, `key_name`, `value_content`, `created_at`, `updated_at`) VALUES (4, 'shipping', 'free_shipping_threshold', 1999, '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `settings` (`id`, `group_name`, `key_name`, `value_content`, `created_at`, `updated_at`) VALUES (5, 'seo', 'default_meta_title', 'Femmeera | Elegant Women\'s Traditional & Western Clothing', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `settings` (`id`, `group_name`, `key_name`, `value_content`, `created_at`, `updated_at`) VALUES (6, 'seo', 'default_meta_description', 'Shop premium sarees, kurtis, dresses, tops, and western trends at Femmeera.', '2026-08-25 15:41:39', '2026-08-25 15:41:39');

-- --------------------------------------------------------
-- Table structure for `shipping_methods`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `shipping_methods`;
CREATE TABLE `shipping_methods` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estimated_min_days` int NOT NULL DEFAULT '3',
  `estimated_max_days` int NOT NULL DEFAULT '5',
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `shipping_methods` (2 rows)
INSERT INTO `shipping_methods` (`id`, `name`, `description`, `price`, `estimated_min_days`, `estimated_max_days`, `status`, `created_at`, `updated_at`) VALUES (1, 'Standard Delivery', 'Reliable doorstep delivery across India in 3–5 business days.', 49.00, 3, 5, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');
INSERT INTO `shipping_methods` (`id`, `name`, `description`, `price`, `estimated_min_days`, `estimated_max_days`, `status`, `created_at`, `updated_at`) VALUES (2, 'Express Delivery', 'Priority express delivery in 1–2 business days.', 99.00, 1, 2, 'ACTIVE', '2026-08-25 15:41:39', '2026-08-25 15:41:39');

-- --------------------------------------------------------
-- Table structure for `shipping_rules`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `shipping_rules`;
CREATE TABLE `shipping_rules` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `min_order_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `max_order_amount` decimal(10,2) DEFAULT NULL,
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estimated_days` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '3-5 working days',
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `tax_rules`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tax_rules`;
CREATE TABLE `tax_rules` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate_percentage` decimal(5,2) NOT NULL DEFAULT '0.00',
  `is_inclusive` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tax_rules` (1 rows)
INSERT INTO `tax_rules` (`id`, `name`, `rate_percentage`, `is_inclusive`, `status`, `created_at`, `updated_at`) VALUES (1, 'GST Apparel 5%', 5.00, 0, 'ACTIVE', '2026-08-25 15:41:40', '2026-08-25 15:41:40');

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'local',
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_type` enum('CUSTOMER','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CUSTOMER',
  `status` enum('ACTIVE','SUSPENDED','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_phone_unique` (`phone`),
  UNIQUE KEY `users_google_id_unique` (`google_id`),
  KEY `users_user_type_status_index` (`user_type`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users` (1 rows)
INSERT INTO `users` (`id`, `name`, `email`, `google_id`, `provider`, `avatar`, `phone`, `password`, `user_type`, `status`, `email_verified_at`, `remember_token`, `created_at`, `updated_at`) VALUES (1, 'Super Administrator', 'admin@femmeera.com', NULL, 'local', NULL, 9999999999, '$2y$04$AsBnwSU05JFwpVenlmgIEuXErdHTj1ufWnIIjf5bpAh0ipvlYJ6DO', 'ADMIN', 'ACTIVE', '2026-08-25 15:41:39', NULL, '2026-08-25 15:41:39', '2026-08-25 15:41:39');

-- --------------------------------------------------------
-- Table structure for `watch_and_shop_videos`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `watch_and_shop_videos`;
CREATE TABLE `watch_and_shop_videos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `poster_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `button_text` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'View Product',
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `watch_and_shop_videos` (4 rows)
INSERT INTO `watch_and_shop_videos` (`id`, `title`, `video_url`, `poster_url`, `product_url`, `button_text`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES (1, 'Royal Bridal Silk Lehenga Look', 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-red-dress-41334-large.mp4', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop', '/product/embroidered-silk-lehenga-set', 'View Product', 1, 'ACTIVE', '2026-08-25 15:41:40', '2026-08-25 15:41:40');
INSERT INTO `watch_and_shop_videos` (`id`, `title`, `video_url`, `poster_url`, `product_url`, `button_text`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES (2, 'Handcrafted Banarasi Saree Elegance', 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-for-the-camera-in-a-studio-41337-large.mp4', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop', '/product/handcrafted-banarasi-silk-saree', 'View Product', 2, 'ACTIVE', '2026-08-25 15:41:40', '2026-08-25 15:41:40');
INSERT INTO `watch_and_shop_videos` (`id`, `title`, `video_url`, `poster_url`, `product_url`, `button_text`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES (3, 'Summer Linen Co-ord Outfit', 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-posing-in-a-flower-field-41335-large.mp4', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop', '/product/linen-co-ord-set', 'View Product', 3, 'ACTIVE', '2026-08-25 15:41:40', '2026-08-25 15:41:40');
INSERT INTO `watch_and_shop_videos` (`id`, `title`, `video_url`, `poster_url`, `product_url`, `button_text`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES (4, 'Designer Anarkali Suit Motion', 'https://assets.mixkit.co/videos/preview/mixkit-model-walking-in-a-fashion-show-41333-large.mp4', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop', '/product/designer-anarkali-suit-set', 'View Product', 4, 'ACTIVE', '2026-08-25 15:41:40', '2026-08-25 15:41:40');

-- --------------------------------------------------------
-- Table structure for `wishlist_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `wishlist_items`;
CREATE TABLE `wishlist_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `wishlist_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlist_items_wishlist_id_product_id_unique` (`wishlist_id`,`product_id`),
  KEY `wishlist_items_product_id_foreign` (`product_id`),
  CONSTRAINT `wishlist_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_items_wishlist_id_foreign` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `wishlists`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wishlists_user_id_foreign` (`user_id`),
  CONSTRAINT `wishlists_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
