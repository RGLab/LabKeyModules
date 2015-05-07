#!/usr/bin/python

import sys, getopt
from os import listdir, mkdir
from os.path import isfile, join, exists
from shutil import copy, copytree, ignore_patterns, move, rmtree
import re

def main(argv):
	immport_archive_dir = '.'
	dest_archive_dir = '.'
	include_docs = False
	try:
		opts, args = getopt.getopt(argv,"i:o:d")
	except getopt.GetoptError:
		print 'test.py [-i <immport_archive_dir>] [-o <dest_archive_dir>] [-d]'
		sys.exit(2)

	for opt, arg in opts:
		if opt == "-i":
			immport_archive_dir = arg
		elif opt == "-o":
			dest_archive_dir = arg
		elif opt == "-d":
			include_docs = True

	source_mysql_dir = join(immport_archive_dir, "MySQL")
	dest_mysql_dir = join(dest_archive_dir, "MySQL")
	in_place = immport_archive_dir == dest_archive_dir

	if not exists(immport_archive_dir):
		print 'Immport archive does not exist: ' + immport_archive_dir
	if not exists(source_mysql_dir):
		print 'Not an Immport study archive, MySQL does not exist in ' + immport_archive_dir

	if not in_place:
		if exists(dest_archive_dir):
			print 'destination already exists'
			sys.exit(2)
		copytree(immport_archive_dir, dest_archive_dir, ignore=ignore_patterns("MySQL"))
		mkdir(dest_mysql_dir)
	else:
		print "Minimizing Immport archive in place"

	study_prefix = "SDY"
	field_sep = "~@~"
	line_sep = "~@@~\n"
	animal_studies = [21, 29, 30, 31, 32, 35, 62, 64, 78, 95, 99, 139, 147, 208, 215, 217, 241, 259, 271, 286, 288]

	data_file_names = [f for f in listdir(source_mysql_dir) if isfile(join(source_mysql_dir,f))]

	for data_file_name in data_file_names:
		print data_file_name
		src_file_path = join(source_mysql_dir, data_file_name)
		dest_file_path = join(dest_mysql_dir, data_file_name)

		has_documents = False
		document_accessions = []
		document_dir_name = data_file_name.split('.')[0] + 's'
		src_doc_dir_path = join(source_mysql_dir, document_dir_name)
		dest_doc_dir_path = join(dest_mysql_dir, document_dir_name)
		if exists(src_doc_dir_path):
			has_documents = True

		src_file = open(src_file_path, "r")
		data = src_file.read()
		src_file.close()
		if study_prefix not in data and "Homo sapiens" not in data:
			print "  No study or species identifiers. Inlcluding all data"
			if not in_place:
				copy(src_file_path, dest_file_path)
				if include_docs and has_documents:
					print "  Including all related documents"
					copytree(src_doc_dir_path, dest_doc_dir_path)
			elif has_documents and not include_docs:
				print "  Deleting all related documents ('-d' to include documents)"
				rmtree(src_doc_dir_path)
			continue

		lines = re.compile(line_sep).split(data)
		dest_file = open(dest_file_path, "w")

		line_count = 0
		included_count = 0
		for line in lines:
			if len(line) == 0:
				continue
			include_line = False
			line_count += 1
			split_line = re.compile(field_sep).split(line)
			if "Homo sapiens" in split_line:
				continue
			if study_prefix not in line:
				include_line = True
			for study in animal_studies:
				if (study_prefix + str(study)) in split_line:
					include_line = True
					break
			if include_line:
				dest_file.write(line + line_sep)
				included_count += 1
				if has_documents:
					document_accessions.append(split_line[0]) # document accession column is currently always first
		print '  Included ' + str(included_count) + ' of ' + str(line_count) + ' data rows'
		dest_file.close()

		if has_documents:
			doc_count = 0
			doc_suffixes = ['', '_map']
			if in_place:
				temp_src_doc_path = join(source_mysql_dir, 'temp')
				rmtree(temp_src_doc_path)
				move(src_doc_dir_path, temp_src_doc_path)
				src_doc_dir_path = temp_src_doc_path
			mkdir(dest_doc_dir_path)
			for document_accession in document_accessions:
				for doc_suffix in doc_suffixes:
					src_doc_path = join(src_doc_dir_path, document_accession + doc_suffix)
					if exists(src_doc_path):
						doc_count += 1
						if include_docs:
							copy(src_doc_path, dest_doc_dir_path)
			if in_place:
				rmtree(src_doc_dir_path) # delete temp dir
			if include_docs:
				print '  Included ' + str(doc_count) + ' related documents'
			else:
				print "  Skipping " + str(doc_count) + " related documents ('-d' to include documents)"


if __name__ == "__main__":
	main(sys.argv[1:])