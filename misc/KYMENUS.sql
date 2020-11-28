-- phpMyAdmin SQL Dump
-- version 4.6.6deb5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 28, 2020 at 06:04 AM
-- Server version: 5.7.29-0ubuntu0.18.04.1
-- PHP Version: 7.2.24-0ubuntu0.18.04.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `KYMENUS`
--
CREATE DATABASE IF NOT EXISTS `KYMENUS` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `KYMENUS`;

-- --------------------------------------------------------

--
-- Table structure for table `CITY`
--

CREATE TABLE `CITY` (
  `city_id` int(11) NOT NULL,
  `state_id` int(11) NOT NULL,
  `city_name` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `DAY_OF_WEEK`
--

CREATE TABLE `DAY_OF_WEEK` (
  `day_id` int(11) NOT NULL,
  `day_of_week` varchar(10) NOT NULL,
  `single` varchar(1) NOT NULL,
  `short` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `HOURS`
--

CREATE TABLE `HOURS` (
  `hours_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `day_id` int(11) NOT NULL,
  `start` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_open` tinyint(1) NOT NULL,
  `special_hours` tinyint(1) NOT NULL,
  `note` varchar(1024) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `MENU`
--

CREATE TABLE `MENU` (
  `menu_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `menu_category_id` int(11) NOT NULL,
  `menu_name` varchar(64) NOT NULL,
  `active` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `MENU_CATEGORY`
--

CREATE TABLE `MENU_CATEGORY` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(64) NOT NULL,
  `category_desc` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `MENU_ITEM`
--

CREATE TABLE `MENU_ITEM` (
  `menu_item_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `price` float NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `uom` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `MENU_ITEM_MENU_PAIR`
--

CREATE TABLE `MENU_ITEM_MENU_PAIR` (
  `menu_item_menu_pair_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `price_override` float DEFAULT NULL,
  `quantity_override` int(11) DEFAULT NULL,
  `uom_override` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `RESTAURANT`
--

CREATE TABLE `RESTAURANT` (
  `restaurant_id` int(11) NOT NULL,
  `zip_id` int(11) NOT NULL,
  `restaurant_name` varchar(128) NOT NULL,
  `address` varchar(256) NOT NULL,
  `active` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `RESTAURANT_CATEGORY`
--

CREATE TABLE `RESTAURANT_CATEGORY` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(64) NOT NULL,
  `category_desc` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `RESTAURANT_CATEGORY_RESTAURANT_PAIR`
--

CREATE TABLE `RESTAURANT_CATEGORY_RESTAURANT_PAIR` (
  `restaurant_category_restaurant_pair_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `restaurant_category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `RESTAURANT_EXTENDED_DETAIL`
--

CREATE TABLE `RESTAURANT_EXTENDED_DETAIL` (
  `restaurant_extended_detail_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `restaurant_extended_detail_category_id` int(11) NOT NULL,
  `detail_value_varchar` varchar(1024) DEFAULT NULL,
  `detail_value_int` int(11) DEFAULT NULL,
  `detail_value_float` float DEFAULT NULL,
  `detail_value_boolean` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `RESTAURANT_EXTENDED_DETAIL_CATEGORY`
--

CREATE TABLE `RESTAURANT_EXTENDED_DETAIL_CATEGORY` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(64) NOT NULL,
  `category_desc` varchar(256) DEFAULT NULL,
  `detail_value_type` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `STATE`
--

CREATE TABLE `STATE` (
  `state_id` int(11) NOT NULL,
  `state_name` varchar(32) NOT NULL,
  `state_code` varchar(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `ZIP`
--

CREATE TABLE `ZIP` (
  `zip_id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `zip_code` varchar(14) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CITY`
--
ALTER TABLE `CITY`
  ADD PRIMARY KEY (`city_id`),
  ADD KEY `fk_state_to_city` (`state_id`);

--
-- Indexes for table `DAY_OF_WEEK`
--
ALTER TABLE `DAY_OF_WEEK`
  ADD PRIMARY KEY (`day_id`);

--
-- Indexes for table `HOURS`
--
ALTER TABLE `HOURS`
  ADD PRIMARY KEY (`hours_id`),
  ADD KEY `fk_day_of_week_to_hours` (`day_id`),
  ADD KEY `fk_restaurant_to_hours` (`restaurant_id`);

--
-- Indexes for table `MENU`
--
ALTER TABLE `MENU`
  ADD PRIMARY KEY (`menu_id`),
  ADD KEY `fk_restaurant_to_menu` (`restaurant_id`),
  ADD KEY `fk_menu_category_to_menu` (`menu_category_id`);

--
-- Indexes for table `MENU_CATEGORY`
--
ALTER TABLE `MENU_CATEGORY`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `MENU_ITEM`
--
ALTER TABLE `MENU_ITEM`
  ADD PRIMARY KEY (`menu_item_id`),
  ADD KEY `fk_restaurant_to_menu_item` (`restaurant_id`);

--
-- Indexes for table `MENU_ITEM_MENU_PAIR`
--
ALTER TABLE `MENU_ITEM_MENU_PAIR`
  ADD PRIMARY KEY (`menu_item_menu_pair_id`),
  ADD KEY `fk_menu_to_menu_pair` (`menu_id`),
  ADD KEY `fk_menu_item_to_menu_pair` (`menu_item_id`);

--
-- Indexes for table `RESTAURANT`
--
ALTER TABLE `RESTAURANT`
  ADD PRIMARY KEY (`restaurant_id`),
  ADD KEY `fk_zip_to_restaurant` (`zip_id`);

--
-- Indexes for table `RESTAURANT_CATEGORY`
--
ALTER TABLE `RESTAURANT_CATEGORY`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `RESTAURANT_CATEGORY_RESTAURANT_PAIR`
--
ALTER TABLE `RESTAURANT_CATEGORY_RESTAURANT_PAIR`
  ADD PRIMARY KEY (`restaurant_category_restaurant_pair_id`),
  ADD KEY `fk_restaurant_to_restaurant_category_pair` (`restaurant_id`),
  ADD KEY `fk_restaurant_category_to_restaurant_category_pair` (`restaurant_category_id`);

--
-- Indexes for table `RESTAURANT_EXTENDED_DETAIL`
--
ALTER TABLE `RESTAURANT_EXTENDED_DETAIL`
  ADD PRIMARY KEY (`restaurant_extended_detail_id`),
  ADD KEY `fk_restaurant_to_restaurant_extended_detail` (`restaurant_id`),
  ADD KEY `fk_extended_detail_category_to_restaurant_extended_detail` (`restaurant_extended_detail_category_id`);

--
-- Indexes for table `RESTAURANT_EXTENDED_DETAIL_CATEGORY`
--
ALTER TABLE `RESTAURANT_EXTENDED_DETAIL_CATEGORY`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `STATE`
--
ALTER TABLE `STATE`
  ADD PRIMARY KEY (`state_id`);

--
-- Indexes for table `ZIP`
--
ALTER TABLE `ZIP`
  ADD PRIMARY KEY (`zip_id`),
  ADD KEY `fk_city_to_zip` (`city_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `CITY`
--
ALTER TABLE `CITY`
  MODIFY `city_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `DAY_OF_WEEK`
--
ALTER TABLE `DAY_OF_WEEK`
  MODIFY `day_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `HOURS`
--
ALTER TABLE `HOURS`
  MODIFY `hours_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `MENU`
--
ALTER TABLE `MENU`
  MODIFY `menu_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `MENU_CATEGORY`
--
ALTER TABLE `MENU_CATEGORY`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `MENU_ITEM`
--
ALTER TABLE `MENU_ITEM`
  MODIFY `menu_item_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `MENU_ITEM_MENU_PAIR`
--
ALTER TABLE `MENU_ITEM_MENU_PAIR`
  MODIFY `menu_item_menu_pair_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `RESTAURANT`
--
ALTER TABLE `RESTAURANT`
  MODIFY `restaurant_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `RESTAURANT_CATEGORY`
--
ALTER TABLE `RESTAURANT_CATEGORY`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `RESTAURANT_CATEGORY_RESTAURANT_PAIR`
--
ALTER TABLE `RESTAURANT_CATEGORY_RESTAURANT_PAIR`
  MODIFY `restaurant_category_restaurant_pair_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `RESTAURANT_EXTENDED_DETAIL`
--
ALTER TABLE `RESTAURANT_EXTENDED_DETAIL`
  MODIFY `restaurant_extended_detail_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `RESTAURANT_EXTENDED_DETAIL_CATEGORY`
--
ALTER TABLE `RESTAURANT_EXTENDED_DETAIL_CATEGORY`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `STATE`
--
ALTER TABLE `STATE`
  MODIFY `state_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `ZIP`
--
ALTER TABLE `ZIP`
  MODIFY `zip_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `CITY`
--
ALTER TABLE `CITY`
  ADD CONSTRAINT `fk_state_to_city` FOREIGN KEY (`state_id`) REFERENCES `STATE` (`state_id`);

--
-- Constraints for table `HOURS`
--
ALTER TABLE `HOURS`
  ADD CONSTRAINT `fk_day_of_week_to_hours` FOREIGN KEY (`day_id`) REFERENCES `DAY_OF_WEEK` (`day_id`),
  ADD CONSTRAINT `fk_restaurant_to_hours` FOREIGN KEY (`restaurant_id`) REFERENCES `RESTAURANT` (`restaurant_id`);

--
-- Constraints for table `MENU`
--
ALTER TABLE `MENU`
  ADD CONSTRAINT `fk_menu_category_to_menu` FOREIGN KEY (`menu_category_id`) REFERENCES `MENU_CATEGORY` (`category_id`),
  ADD CONSTRAINT `fk_restaurant_to_menu` FOREIGN KEY (`restaurant_id`) REFERENCES `RESTAURANT` (`restaurant_id`);

--
-- Constraints for table `MENU_ITEM`
--
ALTER TABLE `MENU_ITEM`
  ADD CONSTRAINT `fk_restaurant_to_menu_item` FOREIGN KEY (`restaurant_id`) REFERENCES `RESTAURANT` (`restaurant_id`);

--
-- Constraints for table `MENU_ITEM_MENU_PAIR`
--
ALTER TABLE `MENU_ITEM_MENU_PAIR`
  ADD CONSTRAINT `fk_menu_item_to_menu_pair` FOREIGN KEY (`menu_item_id`) REFERENCES `MENU_ITEM` (`menu_item_id`),
  ADD CONSTRAINT `fk_menu_to_menu_pair` FOREIGN KEY (`menu_id`) REFERENCES `MENU` (`menu_id`);

--
-- Constraints for table `RESTAURANT`
--
ALTER TABLE `RESTAURANT`
  ADD CONSTRAINT `fk_zip_to_restaurant` FOREIGN KEY (`zip_id`) REFERENCES `ZIP` (`zip_id`);

--
-- Constraints for table `RESTAURANT_CATEGORY_RESTAURANT_PAIR`
--
ALTER TABLE `RESTAURANT_CATEGORY_RESTAURANT_PAIR`
  ADD CONSTRAINT `fk_restaurant_category_to_restaurant_category_pair` FOREIGN KEY (`restaurant_category_id`) REFERENCES `RESTAURANT_CATEGORY` (`category_id`),
  ADD CONSTRAINT `fk_restaurant_to_restaurant_category_pair` FOREIGN KEY (`restaurant_id`) REFERENCES `RESTAURANT` (`restaurant_id`);

--
-- Constraints for table `RESTAURANT_EXTENDED_DETAIL`
--
ALTER TABLE `RESTAURANT_EXTENDED_DETAIL`
  ADD CONSTRAINT `fk_extended_detail_category_to_restaurant_extended_detail` FOREIGN KEY (`restaurant_extended_detail_category_id`) REFERENCES `RESTAURANT_EXTENDED_DETAIL_CATEGORY` (`category_id`),
  ADD CONSTRAINT `fk_restaurant_to_restaurant_extended_detail` FOREIGN KEY (`restaurant_id`) REFERENCES `RESTAURANT` (`restaurant_id`);

--
-- Constraints for table `ZIP`
--
ALTER TABLE `ZIP`
  ADD CONSTRAINT `fk_city_to_zip` FOREIGN KEY (`city_id`) REFERENCES `CITY` (`city_id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
