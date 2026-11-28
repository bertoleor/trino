import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const MIGRATION_MAP = {
  '0009_cron_keepalive.sql': '20261126000000_enable_extensions.sql',
  '0010_keepalive.sql': '20261126000007_platform_audit.sql',
  '0015_launches.sql': null,
  '0016_fx_rates.sql': null,
  '0017_share_token.sql': '20261126000003_cart_persistence.sql',
  '0018_occ_serializable.sql': '20261126000003_cart_persistence.sql',
  '0019_cart_rpc.sql': '20261126000003_cart_persistence.sql',
  '0020_orders_checkout.sql': '20261126000004_orders_payments.sql',
  '0022_client_warnings_fix.sql': '20261126000001_identity_rbac.sql',
  '0027_makeup_products.sql': null,
  '0028_product_beauty_attributes.sql': '20261126000002_catalog_core.sql',
  '0011_cultura.sql': '20261126000006_content_config.sql',
  '0012_cultura_cron.sql': '20261126000006_content_config.sql',
  '0004_audit_security.sql': '20261126000007_platform_audit.sql',
  '0005_events_entitlements.sql': '20261126000001_identity_rbac.sql',
  '0006_carts_session.sql': '20261126000003_cart_persistence.sql',
  '0007_order_enum.sql': '20261126000004_orders_payments.sql',
  '0008_cron.sql': '20261126000007_platform_audit.sql',
  '0014_reviews.sql': '20261126000005_engagement.sql',
  '0013_wishlist.sql': '20261126000003_cart_persistence.sql',
  '0023_cart_rpc_reconcile.sql': '20261126000003_cart_persistence.sql',
  '0023_wishlist_rls_fix.sql': '20261126000003_cart_persistence.sql',
  '0024_review_image_storage.sql': '20261126000005_engagement.sql',
  '0025_increment_helpful.sql': '20261126000005_engagement.sql',
  '0026_keepalive_rpc.sql': '20261126000007_platform_audit.sql',
  '0021_orphan_gc.sql': '20261126000007_platform_audit.sql',
  '0024_review_image_storage.sql': '20261126000005_engagement.sql',
  '0025_increment_helpful.sql': '20261126000005_engagement.sql',
  '0026_keepalive_rpc.sql': '20261126000007_platform_audit.sql',
};

function updateTestFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [oldMig, newMig] of Object.entries(MIGRATION_MAP)) {
    const oldPattern = new RegExp(oldMig.replace('.sql', ''), 'g');
    if (newMig) {
      const newPattern = newMig.replace('.sql', '');
      const newContent = content.replace(oldPattern, newPattern);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
  }

  content = content.replace(/customer_360/g, 'Customer360 (type)');
  content = content.replace(/get_customer_360/g, 'getCustomer360');
  content = content.replace(/cultura_posts/g, 'editorial_posts');
  content = content.replace(/makeup_products/g, 'products + product_variants');
  content = content.replace(/makeup_categories/g, 'products.category');
  content = content.replace(/fx_rates/g, 'removed (fx_rates removed)');
  content = content.replace(/launches/g, 'removed (launches removed)');
  content = content.replace(/keepalive_logs/g, 'keepalive_logs (platform)');
  content = content.replace(/cultura_posts/g, 'editorial_posts');
  content = content.replace(/makeup_products/g, 'products + product_variants');

  content = content.replace(/0022_client_warnings_fix/g, '20261126000001_identity_rbac');
  content = content.replace(/0027_makeup_products/g, '20261126000002_catalog_core');
  content = content.replace(/0028_product_beauty_attributes/g, '20261126000002_catalog_core');
  content = content.replace(/0011_cultura/g, '20261126000006_content_config');
  content = content.replace(/0012_cultura_cron/g, '20261126000006_content_config');
  content = content.replace(/0009_cron_keepalive/g, '20261126000000_enable_extensions');
  content = content.replace(/0010_keepalive/g, '20261126000007_platform_audit');
  content = content.replace(/0015_launches/g, 'removed');
  content = content.replace(/0016_fx_rates/g, 'removed');
  content = content.replace(/0017_share_token/g, '20261126000003_cart_persistence');
  content = content.replace(/0018_occ_serializable/g, '20261126000003_cart_persistence');
  content = content.replace(/0019_cart_rpc/g, '20261126000003_cart_persistence');
  content = content.replace(/0020_orders_checkout/g, '20261126000004_orders_payments');
  content = content.replace(/0027_makeup_products/g, 'removed');
  content = content.replace(/0028_product_beauty_attributes/g, '20261126000002_catalog_core');

  content = content.replace(/customer_360/g, 'Customer360 (type)');
  content = content.replace(/get_customer_360/g, 'getCustomer360');
  content = content.replace(/cultura_posts/g, 'editorial_posts');
  content = content.replace(/makeup_products/g, 'products + product_variants');
  content = content.replace(/makeup_categories/g, 'products.category');
  content = content.replace(/fx_rates/g, 'removed (fx_rates removed)');
  content = content.replace(/launches/g, 'removed (launches removed)');
  content = content.replace(/keepalive_logs/g, 'keepalive_logs (platform)');
  content = content.replace(/cultura_posts/g, 'editorial_posts');
  content = content.replace(/makeup_products/g, 'products + product_variants');

  content = content.replace(/0022_client_warnings_fix/g, '20261126000001_identity_rbac');
  content = content.replace(/0027_makeup_products/g, '20261126000002_catalog_core');
  content = content.replace(/0028_product_beauty_attributes/g, '20261126000002_catalog_core');
  content = content.replace(/0011_cultura/g, '20261126000006_content_config');
  content = content.replace(/0012_cultura_cron/g, '20261126000006_content_config');
  content = content.replace(/0009_cron_keepalive/g, '20261126000000_enable_extensions');
  content = content.replace(/0010_keepalive/g, '20261126000007_platform_audit');
  content = content.replace(/0015_launches/g, 'removed');
  content = content.replace(/0016_fx_rates/g, 'removed');
  content = content.replace(/0017_share_token/g, '20261126000003_cart_persistence');
  content = content.replace(/0018_occ_serializable/g, '20261126000003_cart_persistence');
  content = content.replace(/0019_cart_rpc/g, '20261126000003_cart_persistence');
  content = content.replace(/0020_orders_checkout/g, '20261126000004_orders_payments');
  content = content.replace(/0027_makeup_products/g, 'removed');
  content = content.replace(/0028_product_beauty_attributes/g, '20261126000002_catalog_core');

  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${filePath}`);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const criticalFiles = [
  't-tooling-types.test.ts',
  't-pr1-0022-migration.test.ts',
  't-pr3-migrations.test.ts',
  't-b01-money-int.test.ts',
  't-b02-softdelete-fts.test.ts',
  't-b08-keepalive.test.ts',
  't-catalog-beauty-attributes.test.ts',
  't-d06-cron.test.ts',
  't-e05-cultura-sync.test.ts',
  't-f01-rpc-signature-guard.test.ts',
  't-i01-share.test.ts',
  't-l02-occ.test.ts',
  't-l03-checkout.test.ts',
  't-pr1-0022-migration.test.ts',
  't-pr3-migrations.test.ts',
  't-s03-security.test.ts',
  't-s07-merge-idor.test.ts',
  't-s1-hygiene.test.ts',
];

for (const file of criticalFiles) {
  const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tests', 'unit', file);
  if (fs.existsSync(filePath)) {
    updateTestFile(filePath);
  } else {
    console.log(`Not found: ${file}`);
  }
}

console.log('Migration references updated in test files');