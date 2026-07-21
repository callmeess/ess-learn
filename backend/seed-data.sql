-- EssLearn Database Seed Data Script
-- This script inserts dummy data for testing purposes

-- Clean up existing data (optional - uncomment if you want to clear everything)
/*
DELETE FROM "RoadmapNodes";
DELETE FROM "Roadmaps";
DELETE FROM "BlobStorageLogs";
DELETE FROM "StorageIntegrities";
DELETE FROM "DownloadedVideos";
DELETE FROM "VideoProgresses";
DELETE FROM "Videos";
DELETE FROM "Playlists";
DELETE FROM "Channels";
DELETE FROM "LearningFields";
*/

-- ====================================
-- 1. INSERT LEARNING FIELDS
-- ====================================
INSERT INTO "LearningFields" ("Name", "Description", "Color", "Icon", "CreatedAt", "UpdatedAt")
VALUES 
    ('Web Development', 'Learn modern web development with HTML, CSS, JavaScript, and frameworks.', '#3b82f6', 'web', NOW(), NOW()),
    ('Machine Learning', 'Master machine learning algorithms and deep learning concepts.', '#8b5cf6', 'brain', NOW(), NOW()),
    ('Data Science', 'Learn data analysis, visualization, and statistical methods.', '#ec4899', 'chart', NOW(), NOW()),
    ('Cloud Computing', 'Explore AWS, Azure, and GCP cloud platforms.', '#06b6d4', 'cloud', NOW(), NOW()),
    ('DevOps & Infrastructure', 'Learn Docker, Kubernetes, CI/CD, and infrastructure automation.', '#f59e0b', 'server', NOW(), NOW());

-- ====================================
-- 2. INSERT CHANNELS
-- ====================================
INSERT INTO "Channels" ("YoutubeChannelId", "Title", "ThumbnailUrl", "SubscriberCount", "CreatedAt", "UpdatedAt")
VALUES 
    ('UC-lHJZR3Gqxm24iZ8-7nrGw', 'Traversy Media', 'https://yt3.ggpht.com/-1lQ8q-FPSaA/AAAAAAAAAAI/AAAAAAAAAAA/lWYWjEkR1cQ/s88-c-k-no-mo-rj-c0xffffff/photo.jpg', 2000000, NOW(), NOW()),
    ('UC29ju8bIPH5as8OLFyrsbA', 'Fireship', 'https://yt3.ggpht.com/ytc/APkrFKYy4J-7gVNJF4QWHKIYZP0mAUyxLaLnKjQ2jA=s88-c-k-c0x00ffffff-no-rj', 1000000, NOW(), NOW()),
    ('UCkRfArvrzheW2E7b6SVV_Ew', 'Coding Train', 'https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj', 1500000, NOW(), NOW());

-- ====================================
-- 3. INSERT PLAYLISTS
-- ====================================
INSERT INTO "Playlists" ("FieldId", "ChannelId", "Title", "Description", "ThumbnailUrl", "YoutubePlaylistId", "CreatedAt", "UpdatedAt")
VALUES 
    (1, 1, 'Web Design Tutorial Series', 'Complete web design fundamentals including responsive design and modern CSS techniques.', 'https://img.youtube.com/vi/jX3XJpxOYXU/maxresdefault.jpg', 'PLillGF-RfqbY3c2r0htQyVsgDLn_f-9C7', NOW(), NOW()),
    (1, 2, 'React in 100 Seconds', 'Quick introduction to React and component-based architecture.', 'https://img.youtube.com/vi/Tn6-PIqc4UM/maxresdefault.jpg', NULL, NOW(), NOW()),
    (2, 1, 'Machine Learning Crash Course', 'Introduction to machine learning concepts and practical implementations.', 'https://img.youtube.com/vi/aircAruvnKk/maxresdefault.jpg', 'PLkDaJ6LfdtKiryPZiFW_HVR5qJWYzruyP', NOW(), NOW()),
    (2, 3, 'Neural Networks - The Nature of Code', 'Understanding neural networks and their biological inspiration.', 'https://img.youtube.com/vi/XJ7HLz9VYSc/maxresdefault.jpg', 'PLRqwX-V7Uu6aCibgK3xXJmSR0A0--NySn', NOW(), NOW()),
    (3, 1, 'Data Science with Python', 'Learn data analysis and visualization with pandas and matplotlib.', 'https://img.youtube.com/vi/vmEHCJofslg/maxresdefault.jpg', 'PLillGF-RfqbY3c2r0htQyVsgDLn_f-9C7', NOW(), NOW()),
    (4, 2, 'Cloud Computing 101', 'Fundamentals of cloud computing platforms and services.', 'https://img.youtube.com/vi/SOTamCETW8w/maxresdefault.jpg', NULL, NOW(), NOW()),
    (5, 1, 'Docker & Kubernetes Tutorial', 'Master containerization and orchestration for modern applications.', 'https://img.youtube.com/vi/3c-iBn73dDE/maxresdefault.jpg', 'PLillGF-RfqbY3c2r0htQyVsgDLn_f-9C7', NOW(), NOW());

-- ====================================
-- 4. INSERT VIDEOS
-- ====================================
INSERT INTO "Videos" ("PlaylistId", "YoutubeVideoId", "Title", "Description", "Url", "ThumbnailUrl", "DurationSeconds", "Position", "PublishedAt", "CreatedAt", "UpdatedAt")
VALUES 
    -- Playlist 1: Web Design Tutorial Series
    (1, 'jX3XJpxOYXU', 'Web Design Principles', 'Learn the fundamental principles of modern web design', 'https://www.youtube.com/watch?v=jX3XJpxOYXU', 'https://img.youtube.com/vi/jX3XJpxOYXU/hqdefault.jpg', 1242, 1, '2022-01-15', NOW(), NOW()),
    (1, 'wfaDzSL6ll0', 'CSS Flexbox Mastery', 'Complete guide to mastering CSS Flexbox', 'https://www.youtube.com/watch?v=wfaDzSL6ll0', 'https://img.youtube.com/vi/wfaDzSL6ll0/hqdefault.jpg', 1847, 2, '2022-01-20', NOW(), NOW()),
    (1, 'HN1UjzJHPDc', 'Responsive Design Patterns', 'Master responsive design patterns and best practices', 'https://www.youtube.com/watch?v=HN1UjzJHPDc', 'https://img.youtube.com/vi/HN1UjzJHPDc/hqdefault.jpg', 2156, 3, '2022-02-01', NOW(), NOW()),
    (1, '9zXO9kc7rWc', 'CSS Grid Layout', 'Advanced CSS Grid techniques for complex layouts', 'https://www.youtube.com/watch?v=9zXO9kc7rWc', 'https://img.youtube.com/vi/9zXO9kc7rWc/hqdefault.jpg', 1534, 4, '2022-02-10', NOW(), NOW()),
    
    -- Playlist 2: React in 100 Seconds
    (2, 'Tn6-PIqc4UM', 'React in 100 Seconds', 'Lightning-fast introduction to React', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 'https://img.youtube.com/vi/Tn6-PIqc4UM/hqdefault.jpg', 100, 1, '2021-06-20', NOW(), NOW()),
    
    -- Playlist 3: Machine Learning Crash Course
    (3, 'aircAruvnKk', 'Neural Networks Explained', 'Deep dive into neural networks fundamentals', 'https://www.youtube.com/watch?v=aircAruvnKk', 'https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg', 823, 1, '2017-10-09', NOW(), NOW()),
    (3, 'ILsxfylQAXM', 'Gradient Descent Explained', 'Understanding gradient descent optimization', 'https://www.youtube.com/watch?v=ILsxfylQAXM', 'https://img.youtube.com/vi/ILsxfylQAXM/hqdefault.jpg', 512, 2, '2017-10-20', NOW(), NOW()),
    (3, 'gccEJvdRJjw', 'Supervised vs Unsupervised Learning', 'Key differences and use cases', 'https://www.youtube.com/watch?v=gccEJvdRJjw', 'https://img.youtube.com/vi/gccEJvdRJjw/hqdefault.jpg', 1124, 3, '2017-11-05', NOW(), NOW()),
    
    -- Playlist 4: Neural Networks - The Nature of Code
    (4, 'XJ7HLz9VYSc', 'Neural Networks - Part 1', 'Introduction to artificial neural networks', 'https://www.youtube.com/watch?v=XJ7HLz9VYSc', 'https://img.youtube.com/vi/XJ7HLz9VYSc/hqdefault.jpg', 1823, 1, '2016-11-20', NOW(), NOW()),
    (4, 'vEgSJoNzV9c', 'Neural Networks - Part 2', 'Advanced neural network concepts', 'https://www.youtube.com/watch?v=vEgSJoNzV9c', 'https://img.youtube.com/vi/vEgSJoNzV9c/hqdefault.jpg', 2045, 2, '2016-12-10', NOW(), NOW()),
    
    -- Playlist 5: Data Science with Python
    (5, 'vmEHCJofslg', 'Data Science Basics', 'Introduction to data science with Python', 'https://www.youtube.com/watch?v=vmEHCJofslg', 'https://img.youtube.com/vi/vmEHCJofslg/hqdefault.jpg', 2341, 1, '2022-03-10', NOW(), NOW()),
    (5, 'fSERNx-rvH4', 'Pandas for Data Analysis', 'Master pandas library for data manipulation', 'https://www.youtube.com/watch?v=fSERNx-rvH4', 'https://img.youtube.com/vi/fSERNx-rvH4/hqdefault.jpg', 2134, 2, '2022-03-20', NOW(), NOW()),
    (5, 'kHwlB_J7Hl0', 'Data Visualization with Matplotlib', 'Create stunning visualizations with matplotlib', 'https://www.youtube.com/watch?v=kHwlB_J7Hl0', 'https://img.youtube.com/vi/kHwlB_J7Hl0/hqdefault.jpg', 1845, 3, '2022-04-01', NOW(), NOW()),
    
    -- Playlist 6: Cloud Computing 101
    (6, 'SOTamCETW8w', 'Cloud Computing Fundamentals', 'Understanding cloud computing basics', 'https://www.youtube.com/watch?v=SOTamCETW8w', 'https://img.youtube.com/vi/SOTamCETW8w/hqdefault.jpg', 1534, 1, '2021-05-15', NOW(), NOW()),
    (6, 'dLvJ8VPH0ec', 'AWS Fundamentals', 'Getting started with Amazon Web Services', 'https://www.youtube.com/watch?v=dLvJ8VPH0ec', 'https://img.youtube.com/vi/dLvJ8VPH0ec/hqdefault.jpg', 1823, 2, '2021-06-10', NOW(), NOW()),
    
    -- Playlist 7: Docker & Kubernetes Tutorial
    (7, '3c-iBn73dDE', 'Docker for Beginners', 'Complete Docker introduction', 'https://www.youtube.com/watch?v=3c-iBn73dDE', 'https://img.youtube.com/vi/3c-iBn73dDE/hqdefault.jpg', 2145, 1, '2021-04-20', NOW(), NOW()),
    (7, 'X48VuDVv0Z0', 'Kubernetes Basics', 'Introduction to container orchestration', 'https://www.youtube.com/watch?v=X48VuDVv0Z0', 'https://img.youtube.com/vi/X48VuDVv0Z0/hqdefault.jpg', 1956, 2, '2021-05-10', NOW(), NOW());

-- ====================================
-- 5. INSERT VIDEO PROGRESS (Sample user progress)
-- ====================================
INSERT INTO "VideoProgresses" ("VideoId", "WatchedDurationSeconds", "IsCompleted", "CompletedAt", "CreatedAt", "UpdatedAt")
VALUES 
    (1, 1242, true, NOW(), NOW(), NOW()),
    (2, 900, false, NULL, NOW(), NOW()),
    (3, 2156, true, NOW(), NOW(), NOW()),
    (5, 50, false, NULL, NOW(), NOW()),
    (6, 823, true, NOW(), NOW(), NOW()),
    (7, 256, false, NULL, NOW(), NOW()),
    (11, 1500, false, NULL, NOW(), NOW()),
    (12, 2134, true, NOW(), NOW(), NOW()),
    (14, 1534, true, NOW(), NOW(), NOW()),
    (16, 1200, false, NULL, NOW(), NOW());

-- ====================================
-- 6. INSERT DOWNLOADED VIDEOS
-- ====================================
INSERT INTO "DownloadedVideos" ("VideoId", "Quality", "FormatId", "Container", "FileSize", "BlobPath", "BlobBucket", "Sha256Hash", "DownloadedAt", "CreatedAt", "UpdatedAt")
VALUES 
    (1, '720p', 'best', 'mp4', 450000000, '/downloads/jX3XJpxOYXU_720p.mp4', 'esslearn-videos', 'abc123def456abc123def456abc123def456abc123def456abc123def456', NOW(), NOW(), NOW()),
    (3, '1080p', 'best', 'mp4', 890000000, '/downloads/HN1UjzJHPDc_1080p.mp4', 'esslearn-videos', 'xyz789uvw123xyz789uvw123xyz789uvw123xyz789uvw123xyz789uvw123', NOW(), NOW(), NOW()),
    (6, '720p', 'best', 'mp4', 380000000, '/downloads/aircAruvnKk_720p.mp4', 'esslearn-videos', 'qwe456rty789qwe456rty789qwe456rty789qwe456rty789qwe456rty789', NOW(), NOW(), NOW()),
    (11, '1080p', 'best', 'mp4', 920000000, '/downloads/vmEHCJofslg_1080p.mp4', 'esslearn-videos', 'asd123fgh456asd123fgh456asd123fgh456asd123fgh456asd123fgh456', NOW(), NOW(), NOW()),
    (12, '720p', 'best', 'mp4', 560000000, '/downloads/fSERNx-rvH4_720p.mp4', 'esslearn-videos', 'zxc789vbn123zxc789vbn123zxc789vbn123zxc789vbn123zxc789vbn123', NOW(), NOW(), NOW());

-- ====================================
-- 7. INSERT STORAGE INTEGRITY RECORDS
-- ====================================
INSERT INTO "StorageIntegrities" ("BlobPath", "BlobBucket", "Sha256Hash", "IsValid", "CheckedAt", "CreatedAt", "UpdatedAt", "DownloadedVideoId")
VALUES 
    ('/downloads/jX3XJpxOYXU_720p.mp4', 'esslearn-videos', 'abc123def456abc123def456abc123def456abc123def456abc123def456', true, NOW(), NOW(), NOW(), 1),
    ('/downloads/HN1UjzJHPDc_1080p.mp4', 'esslearn-videos', 'xyz789uvw123xyz789uvw123xyz789uvw123xyz789uvw123xyz789uvw123', true, NOW(), NOW(), NOW(), 2),
    ('/downloads/aircAruvnKk_720p.mp4', 'esslearn-videos', 'qwe456rty789qwe456rty789qwe456rty789qwe456rty789qwe456rty789', true, NOW(), NOW(), NOW(), 3),
    ('/downloads/vmEHCJofslg_1080p.mp4', 'esslearn-videos', 'asd123fgh456asd123fgh456asd123fgh456asd123fgh456asd123fgh456', true, NOW(), NOW(), NOW(), 4),
    ('/downloads/fSERNx-rvH4_720p.mp4', 'esslearn-videos', 'zxc789vbn123zxc789vbn123zxc789vbn123zxc789vbn123zxc789vbn123', true, NOW(), NOW(), NOW(), 5);

-- ====================================
-- 8. INSERT BLOB STORAGE LOGS
-- ====================================
INSERT INTO "BlobStorageLogs" ("Operation", "BlobPath", "BlobBucket", "Success", "ErrorMessage", "CreatedAt")
VALUES 
    ('UPLOAD', '/downloads/jX3XJpxOYXU_720p.mp4', 'esslearn-videos', true, NULL, NOW() - INTERVAL 7 day),
    ('UPLOAD', '/downloads/HN1UjzJHPDc_1080p.mp4', 'esslearn-videos', true, NULL, NOW() - INTERVAL 6 day),
    ('UPLOAD', '/downloads/aircAruvnKk_720p.mp4', 'esslearn-videos', true, NULL, NOW() - INTERVAL 5 day),
    ('VERIFY', '/downloads/jX3XJpxOYXU_720p.mp4', 'esslearn-videos', true, NULL, NOW() - INTERVAL 3 day),
    ('UPLOAD', '/downloads/vmEHCJofslg_1080p.mp4', 'esslearn-videos', true, NULL, NOW() - INTERVAL 2 day),
    ('VERIFY', '/downloads/HN1UjzJHPDc_1080p.mp4', 'esslearn-videos', true, NULL, NOW() - INTERVAL 1 day),
    ('UPLOAD', '/downloads/fSERNx-rvH4_720p.mp4', 'esslearn-videos', true, NULL, NOW());

-- ====================================
-- 9. INSERT ROADMAPS
-- ====================================
INSERT INTO "Roadmaps" ("Name", "Description", "Iconurl", "Progress", "CreatedAt", "UpdatedAt")
VALUES 
    ('Web Developer Bootcamp', 'Complete learning path to become a full-stack web developer', 'https://img.icons8.com/color/96/000000/html-5.png', 0.35, NOW(), NOW()),
    ('AI & Machine Learning Path', 'Comprehensive guide to machine learning and artificial intelligence', 'https://img.icons8.com/color/96/000000/machine-learning.png', 0.25, NOW(), NOW()),
    ('Data Science Specialist', 'Master data analysis, visualization, and statistical methods', 'https://img.icons8.com/color/96/000000/data-science.png', 0.45, NOW(), NOW()),
    ('Cloud & DevOps Engineer', 'Learn cloud platforms and DevOps best practices', 'https://img.icons8.com/color/96/000000/cloud-storage.png', 0.15, NOW(), NOW());

-- ====================================
-- 10. INSERT ROADMAP NODES
-- ====================================
-- Web Developer Bootcamp
INSERT INTO "RoadmapNodes" ("RoadmapId", "PlaylistId", "ParentId", "Position", "LevelOrder", "CreatedAt", "UpdatedAt")
VALUES 
    (1, 1, NULL, 1, 0, NOW(), NOW()), -- Web Design Tutorial Series (Level 0)
    (1, 2, 1, 2, 1, NOW(), NOW()), -- React in 100 Seconds (Level 1, Child of Web Design)
    (1, 7, 2, 3, 2, NOW(), NOW()); -- Docker & Kubernetes (Level 2, Child of React)

-- AI & Machine Learning Path
INSERT INTO "RoadmapNodes" ("RoadmapId", "PlaylistId", "ParentId", "Position", "LevelOrder", "CreatedAt", "UpdatedAt")
VALUES 
    (2, 3, NULL, 1, 0, NOW(), NOW()), -- Machine Learning Crash Course (Level 0)
    (2, 4, 4, 2, 1, NOW(), NOW()); -- Neural Networks (Level 1, Child of ML Course)

-- Data Science Specialist
INSERT INTO "RoadmapNodes" ("RoadmapId", "PlaylistId", "ParentId", "Position", "LevelOrder", "CreatedAt", "UpdatedAt")
VALUES 
    (3, 5, NULL, 1, 0, NOW(), NOW()), -- Data Science with Python (Level 0)
    (3, 3, 7, 2, 1, NOW(), NOW()), -- Machine Learning Course (Level 1, Child of Data Science)
    (3, 4, 8, 3, 1, NOW(), NOW()); -- Neural Networks (Level 1, Child of Data Science)

-- Cloud & DevOps Engineer
INSERT INTO "RoadmapNodes" ("RoadmapId", "PlaylistId", "ParentId", "Position", "LevelOrder", "CreatedAt", "UpdatedAt")
VALUES 
    (4, 6, NULL, 1, 0, NOW(), NOW()), -- Cloud Computing 101 (Level 0)
    (4, 7, 10, 2, 1, NOW(), NOW()); -- Docker & Kubernetes (Level 1, Child of Cloud Computing)

-- ====================================
-- Summary of inserted data:
-- ====================================
-- Fields: 5 learning fields
-- Channels: 3 YouTube channels
-- Playlists: 7 playlists
-- Videos: 17 videos across playlists
-- Video Progress: 10 sample progress entries
-- Downloaded Videos: 5 downloaded videos
-- Storage Integrity: 5 integrity records
-- Blob Storage Logs: 7 operation logs
-- Roadmaps: 4 learning paths
-- Roadmap Nodes: 10 nodes establishing curriculum structure
