-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 02, 2024 at 03:46 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `transport`
--

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `id` int(10) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `ph` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `bank_name` varchar(50) DEFAULT NULL,
  `acc_no` varchar(30) DEFAULT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `ifsc` varchar(30) DEFAULT NULL,
  `holder_name` varchar(50) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`id`, `name`, `ph`, `email`, `company`, `address`, `bank_name`, `acc_no`, `branch`, `ifsc`, `holder_name`, `created_date`, `status`) VALUES
(1, 'd', 'd', 'd', 'd', 'dd', 'd', 'd', 'd', 'd', 'd', '2024-03-14 04:18:00', 1),
(2, 'e', 'e', 'ee', 'e', 'e', 'e', 'e', 'e', 'e', 'e', '2024-03-14 04:18:42', 2),
(3, 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'aa', 'a', 'a', '2024-03-14 04:20:27', 1),
(4, 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', '2024-03-14 04:20:45', 1),
(5, 'c', 'c', 'c', 'c', 'c', 'c', 'c', 'c', 'c', 'c', '2024-03-14 04:21:13', 1),
(6, '', '', '', 'RED dot', '', '', '', '', '', '', '2024-04-17 04:42:35', 1);

-- --------------------------------------------------------

--
-- Table structure for table `dispatch`
--

CREATE TABLE `dispatch` (
  `id` int(10) NOT NULL,
  `truck_id` int(10) DEFAULT NULL,
  `driver_id` int(11) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `code` varchar(20) DEFAULT NULL,
  `from` text NOT NULL,
  `to` text NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=pending, 3=complete',
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `due` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payable_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dispatch`
--

INSERT INTO `dispatch` (`id`, `truck_id`, `driver_id`, `date`, `code`, `from`, `to`, `status`, `total`, `due`, `payable_amount`, `description`) VALUES
(3, 3, 4, '2024-07-24', '46', 'kalkata', 'kalyani', 0, 0.00, 0.00, 0.00, 'gdg'),
(4, 3, 4, '2024-07-25', '45', 'ranaghat', 'karishnagar', 0, 0.00, 0.00, 0.00, 'rter'),
(5, 3, 4, '2024-07-25', '44', 'kalyani', 'krishnagar', 0, 0.00, 0.00, 0.00, 'rtret'),
(10, 3, 4, '2024-07-25', '633', 'kalkata', 'kalyani', 0, 0.00, 0.00, 0.00, 'test');

-- --------------------------------------------------------

--
-- Table structure for table `dispatch_item`
--

CREATE TABLE `dispatch_item` (
  `id` int(10) NOT NULL,
  `dispatch_id` int(10) NOT NULL DEFAULT 0,
  `part_challan_id` int(11) NOT NULL,
  `product_id` int(10) NOT NULL DEFAULT 0,
  `quantity` int(4) NOT NULL DEFAULT 1,
  `dispatch_unit` int(11) NOT NULL DEFAULT 0,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dispatch_item`
--

INSERT INTO `dispatch_item` (`id`, `dispatch_id`, `part_challan_id`, `product_id`, `quantity`, `dispatch_unit`, `unit_price`, `total`) VALUES
(8, 3, 39, 9, 300, 0, 70.00, 21000.00),
(9, 3, 40, 8, 101, 0, 60.00, 6060.00),
(10, 3, 41, 9, 100, 0, 50.00, 5000.00),
(11, 3, 41, 8, 110, 0, 40.00, 4400.00),
(12, 4, 40, 8, 1, 0, 90.00, 90.00),
(13, 5, 39, 9, 50, 0, 50.00, 2500.00),
(14, 5, 39, 8, 450, 0, 50.00, 22500.00),
(15, 5, 40, 9, 200, 0, 40.00, 8000.00),
(16, 5, 41, 9, 25, 0, 30.00, 750.00),
(17, 5, 41, 8, 10, 0, 40.00, 400.00),
(22, 10, 40, 9, 39, 0, 50.00, 1950.00);

-- --------------------------------------------------------

--
-- Table structure for table `driver`
--

CREATE TABLE `driver` (
  `id` int(10) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `ph` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `bank_name` varchar(50) DEFAULT NULL,
  `acc_no` varchar(30) DEFAULT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `ifsc` varchar(30) DEFAULT NULL,
  `holder_name` varchar(50) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=enable,2=disable'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `driver`
--

INSERT INTO `driver` (`id`, `name`, `ph`, `email`, `address`, `bank_name`, `acc_no`, `branch`, `ifsc`, `holder_name`, `created_date`, `status`) VALUES
(3, 'Driver 3', '485688', 'driver3@gmail.om', 'kolkata', 'Indian', '45856983684', 'kolkata', '12594', 'drive 3', '2024-07-25 07:12:57', 1),
(4, 'Driver 4', '485688894', 'driver4@gmail.om', 'krishnagar', 'SBi', '48605697164', 'krishnagar', '594684', 'drive 4', '2024-07-25 07:12:57', 1),
(5, 'Driver 5', '48958756', 'driver5@gmail.com', 'karimpur', 'SBI', '47953641', 'karimpur', '7859', 'driver-5', '2024-07-25 09:22:58', 1);

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `id` int(10) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `ph` varchar(50) NOT NULL,
  `ph_alt` varchar(50) DEFAULT NULL,
  `pwd` varchar(100) DEFAULT NULL,
  `login_time` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `type` enum('admin','accounts','hr','user') NOT NULL DEFAULT 'user',
  `pic` varchar(255) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `access_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`id`, `name`, `email`, `ph`, `ph_alt`, `pwd`, `login_time`, `address`, `type`, `pic`, `created_date`, `status`, `access_token`) VALUES
(1, 'Admin', 'admin@dokume.in', '1', NULL, 'U2hhcm93NzIkMHEhM2xkZFlybmI-dTBh', '1721882780', '', 'admin', NULL, '2024-03-12 13:18:42', 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3MjI2MDcxODZ9.UyozgITKILzsqcopmRImQtOD2K9rGEr6dHlbv41N4UQ'),
(3, 'a', 'a', 'a', 'a', 'U2hhcm93NzIkMHEhM2xkZFlybmI-dTBh', 'a', 'a', 'admin', NULL, '2024-03-14 03:40:11', 1, NULL),
(4, 'b', 'b', 'b', 'b', 'U2hhcm93NzIkMHEhM2xkZFlybmI-dTBi', 'b', 'b', 'accounts', NULL, '2024-03-14 03:40:38', 1, NULL),
(5, 'c', 'c', 'c', 'c', 'U2hhcm93NzIkMHEhM2xkZFlybmI-dTBj', 'c', 'c', 'hr', NULL, '2024-03-14 03:40:50', 1, NULL),
(6, 'd', 'd', 'd', 'd', 'U2hhcm93NzIkMHEhM2xkZFlybmI-dTBk', 'd', 'd', 'user', NULL, '2024-03-14 03:40:59', 2, NULL),
(7, 'ea', 'ea', 'ea', 'e a', 'U2hhcm93NzIkMHEhM2xkZFlybmI-dTBlYQ', 'ea', 'ea', 'accounts', NULL, '2024-03-14 03:41:14', 2, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `emp_doc`
--

CREATE TABLE `emp_doc` (
  `id` int(10) NOT NULL,
  `emp_id` int(10) NOT NULL DEFAULT 0,
  `doc_type` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=gov,1=certificates',
  `doc_title` varchar(100) DEFAULT NULL,
  `doc` varchar(255) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emp_doc`
--

INSERT INTO `emp_doc` (`id`, `emp_id`, `doc_type`, `doc_title`, `doc`, `created_date`) VALUES
(12, 1, 0, 'hs cer', '1714198943981-auth.js', '2024-04-27 06:22:23'),
(13, 1, 0, 'hjhgkgk hkh ', '1714198969065-_Electron ReactJS Desktop - Dinner (section).pdf', '2024-04-27 06:22:49');

-- --------------------------------------------------------

--
-- Table structure for table `full_challan`
--

CREATE TABLE `full_challan` (
  `id` int(10) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `truck_id` int(11) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `code` varchar(20) DEFAULT NULL,
  `from` text NOT NULL,
  `to` text NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=pending, 3=complete',
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `full_challan`
--

INSERT INTO `full_challan` (`id`, `driver_id`, `truck_id`, `date`, `code`, `from`, `to`, `status`, `description`) VALUES
(10, 4, 3, '2024-07-25', '54', 'kalkata', 'karimpur', 0, 'kalkata to karimpur'),
(11, 4, 3, '2024-07-31', '45', 'ka', 'ra', 0, 'utr'),
(12, 4, 3, '2024-07-31', '45', 'ka', 'ra', 0, 'utr'),
(13, 5, 4, '2024-08-01', '45', 'krishnagar', 'kalkata', 0, 'ktok');

-- --------------------------------------------------------

--
-- Table structure for table `full_challan_item`
--

CREATE TABLE `full_challan_item` (
  `id` int(10) NOT NULL,
  `full_challan_id` int(10) NOT NULL DEFAULT 0,
  `part_challan_id` int(11) NOT NULL,
  `product_id` int(10) NOT NULL DEFAULT 0,
  `quantity` int(4) NOT NULL DEFAULT 1,
  `dispatch_unit` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `full_challan_item`
--

INSERT INTO `full_challan_item` (`id`, `full_challan_id`, `part_challan_id`, `product_id`, `quantity`, `dispatch_unit`) VALUES
(19, 10, 39, 9, 50, 50),
(20, 12, 39, 8, 25, 25),
(21, 12, 40, 9, 39, 39),
(22, 10, 40, 9, 40, 40),
(23, 10, 41, 9, 25, 25),
(24, 10, 41, 8, 10, 10),
(25, 13, 42, 8, 100, 0),
(26, 13, 42, 9, 120, 0),
(27, 13, 43, 8, 150, 0),
(28, 13, 43, 9, 130, 0);

-- --------------------------------------------------------

--
-- Table structure for table `part_challan`
--

CREATE TABLE `part_challan` (
  `id` int(10) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `code` varchar(20) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=pending, 3=complete',
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `part_challan`
--

INSERT INTO `part_challan` (`id`, `vendor_id`, `date`, `code`, `status`, `description`) VALUES
(39, 4, '2024-07-24', '52', 0, 'tr'),
(40, 5, '2024-07-24', '54', 0, 'teer'),
(41, 5, '2024-07-24', '54', 0, 'tye'),
(42, 6, '2024-08-02', '54', 0, ''),
(43, 5, '2024-08-03', '45', 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `part_challan_item`
--

CREATE TABLE `part_challan_item` (
  `id` int(10) NOT NULL,
  `part_challan_id` int(10) NOT NULL DEFAULT 0,
  `product_id` int(10) NOT NULL DEFAULT 0,
  `quantity` int(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `part_challan_item`
--

INSERT INTO `part_challan_item` (`id`, `part_challan_id`, `product_id`, `quantity`) VALUES
(87, 39, 9, 200),
(88, 39, 8, 450),
(89, 40, 8, 101),
(90, 40, 9, 200),
(91, 41, 9, 100),
(92, 41, 8, 110),
(93, 42, 8, 100),
(94, 42, 9, 120),
(95, 43, 8, 150),
(96, 43, 9, 130);

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id` int(10) NOT NULL,
  `part_challan_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `from` varchar(100) NOT NULL,
  `to` varchar(100) NOT NULL,
  `note` text NOT NULL,
  `vendor` int(11) DEFAULT NULL,
  `due` decimal(10,2) NOT NULL,
  `payable_amount` decimal(10,2) NOT NULL,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`id`, `part_challan_id`, `date`, `from`, `to`, `note`, `vendor`, `due`, `payable_amount`, `total`) VALUES
(27, 40, '2024-07-03', '', '', 'test', 5, 11100.00, 5000.00, 16100.00),
(28, 40, '2024-07-29', '', '', '', 5, 6100.00, 5000.00, 16100.00),
(29, 41, '2024-08-27', '', '', '', 5, 5550.00, 5000.00, 10550.00),
(30, 40, '2024-07-24', '', '', '', 5, 0.00, 6100.00, 16100.00),
(31, 39, '2024-07-18', '', '', '', 4, 21000.00, 25000.00, 46000.00),
(32, 39, '2024-07-26', '', '', '', 4, 1000.00, 20000.00, 46000.00);

-- --------------------------------------------------------

--
-- Table structure for table `payment_item`
--

CREATE TABLE `payment_item` (
  `id` int(10) NOT NULL,
  `payment_id` int(10) NOT NULL DEFAULT 0,
  `product_id` int(10) NOT NULL DEFAULT 0,
  `quantity` int(4) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_item`
--

INSERT INTO `payment_item` (`id`, `payment_id`, `product_id`, `quantity`, `unit_price`, `total`) VALUES
(15, 27, 8, 101, 60.00, 6060.00),
(16, 27, 8, 1, 90.00, 90.00),
(17, 27, 9, 200, 40.00, 8000.00),
(18, 27, 9, 39, 50.00, 1950.00),
(19, 28, 8, 101, 60.00, 6060.00),
(20, 28, 8, 1, 90.00, 90.00),
(21, 28, 9, 200, 40.00, 8000.00),
(22, 28, 9, 39, 50.00, 1950.00),
(23, 29, 9, 100, 50.00, 5000.00),
(24, 29, 8, 110, 40.00, 4400.00),
(25, 29, 9, 25, 30.00, 750.00),
(26, 29, 8, 10, 40.00, 400.00),
(27, 30, 8, 101, 60.00, 6060.00),
(28, 30, 8, 1, 90.00, 90.00),
(29, 30, 9, 200, 40.00, 8000.00),
(30, 30, 9, 39, 50.00, 1950.00),
(31, 31, 9, 300, 70.00, 21000.00),
(32, 31, 9, 50, 50.00, 2500.00),
(33, 31, 8, 450, 50.00, 22500.00),
(34, 32, 9, 300, 70.00, 21000.00),
(35, 32, 9, 50, 50.00, 2500.00),
(36, 32, 8, 450, 50.00, 22500.00);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` int(10) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `code` varchar(30) DEFAULT NULL,
  `unit` text NOT NULL,
  `weight` decimal(10,2) NOT NULL DEFAULT 0.00,
  `description` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `name`, `code`, `unit`, `weight`, `description`, `status`) VALUES
(8, 'Bag 1', '154', 'basta', 10.00, '10 kg bag', 1),
(9, 'Bag 2', '254', 'basta', 20.00, '20 kg Bag', 1);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(10) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `ph` varchar(50) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `signature` varchar(225) NOT NULL,
  `designation` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `name`, `email`, `ph`, `address`, `logo`, `signature`, `designation`) VALUES
(1, 'transport', 'transport.gmail.com', '+8801988 600 400', 'kolkata', '1722241259065-Viactiv_Sponsorzeile_kl1.png', '1718193857790-signature.webp', 'Transport');

-- --------------------------------------------------------

--
-- Table structure for table `truck`
--

CREATE TABLE `truck` (
  `id` int(10) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `number` varchar(50) DEFAULT NULL,
  `driver_id` int(30) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '0=inactive,1=active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `truck`
--

INSERT INTO `truck` (`id`, `name`, `number`, `driver_id`, `created_date`, `status`) VALUES
(3, 'sonalika', '45864558', 3, '2024-07-25 08:26:11', 1),
(4, 'Mohandra', '4587956324', 4, '2024-07-26 04:42:48', 1);

-- --------------------------------------------------------

--
-- Table structure for table `vendor`
--

CREATE TABLE `vendor` (
  `id` int(10) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `ph` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `bank_name` varchar(50) DEFAULT NULL,
  `acc_no` varchar(30) DEFAULT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `ifsc` varchar(30) DEFAULT NULL,
  `holder_name` varchar(50) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '0=inactive,1=active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendor`
--

INSERT INTO `vendor` (`id`, `name`, `ph`, `email`, `company`, `address`, `bank_name`, `acc_no`, `branch`, `ifsc`, `holder_name`, `created_date`, `status`) VALUES
(3, 'test', 'werewfdg', 'dfgdgd', 'ewewr', 'dgdfg', 'fgfdg', 'dfgdf', 'jgjty', 'sfsfdgdg', 'dfgdfg', '2024-07-25 05:37:07', 1),
(4, 'vendor2', '458946594', 'vendor2@gmail.com', 'vendor2', 'kolkata', 'SBI', '4879589', 'kolkata', '14595', 'vendor2', '2024-07-25 10:47:17', 1),
(5, 'vendor3', '4589443594', 'vendor3@gmail.com', 'vendor3', 'kolkata', 'SBI', '487957', 'kolkata', '14595', 'vendor3', '2024-07-25 10:47:17', 1),
(6, 'vendor4', '4584454', 'vendor4@gmail.com', 'vendor4', 'howrha', 'SBI', '487957885', 'kolkata', '14595', 'vendor4', '2024-07-25 10:47:17', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dispatch`
--
ALTER TABLE `dispatch`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dispatch_item`
--
ALTER TABLE `dispatch_item`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `driver`
--
ALTER TABLE `driver`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `emp_doc`
--
ALTER TABLE `emp_doc`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `full_challan`
--
ALTER TABLE `full_challan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `full_challan_item`
--
ALTER TABLE `full_challan_item`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `part_challan`
--
ALTER TABLE `part_challan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `part_challan_item`
--
ALTER TABLE `part_challan_item`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_item`
--
ALTER TABLE `payment_item`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `truck`
--
ALTER TABLE `truck`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vendor`
--
ALTER TABLE `vendor`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `dispatch`
--
ALTER TABLE `dispatch`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `dispatch_item`
--
ALTER TABLE `dispatch_item`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `driver`
--
ALTER TABLE `driver`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `emp_doc`
--
ALTER TABLE `emp_doc`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `full_challan`
--
ALTER TABLE `full_challan`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `full_challan_item`
--
ALTER TABLE `full_challan_item`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `part_challan`
--
ALTER TABLE `part_challan`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `part_challan_item`
--
ALTER TABLE `part_challan_item`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `payment_item`
--
ALTER TABLE `payment_item`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `truck`
--
ALTER TABLE `truck`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `vendor`
--
ALTER TABLE `vendor`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
