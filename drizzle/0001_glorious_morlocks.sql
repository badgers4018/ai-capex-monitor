CREATE TABLE `changelog_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(32) NOT NULL,
	`tag` varchar(64) NOT NULL,
	`headline` text NOT NULL,
	`detail` text,
	`signal` enum('bullish','bearish','neutral') NOT NULL DEFAULT 'neutral',
	`source` varchar(256),
	`refreshRunId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `changelog_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskUid` varchar(65),
	`status` enum('running','completed','failed') NOT NULL DEFAULT 'running',
	`topicsProcessed` int DEFAULT 0,
	`summary` text,
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `refresh_runs_id` PRIMARY KEY(`id`)
);
